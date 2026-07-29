// Bridges vscode-jsonrpc (what the vendored async client speaks) to the tsgo wasm's
// byte-oriented stdin/stdout, which carries LSP-style Content-Length framed JSON.
import {
  AbstractMessageReader,
  AbstractMessageWriter,
  createMessageConnection,
  type DataCallback,
  type Disposable,
  type Message,
  type MessageConnection,
  type MessageWriter,
} from "vscode-jsonrpc";

/** A raw byte transport — typically a booted tsgo wasm's stdin/stdout. */
export interface ByteTransport {
  /** Write bytes to the server's stdin. */
  send(bytes: Uint8Array): void;
  /** Register a handler for bytes the server writes to stdout. */
  onReceive(handler: (bytes: Uint8Array) => void): void;
}

// vscode-jsonrpc's common entry installs no runtime abstraction layer (RAL); the
// entrypoint must install one before the first request by importing the matching
// side-effect module — `vscode-jsonrpc/browser` in the app, `vscode-jsonrpc/node`
// under Deno/Node. (Deno can't resolve the browser-only export condition, so the
// two environments load different installers.)

/** Create a JSON-RPC connection over a raw byte transport (not yet listening). */
export function createStdioConnection(transport: ByteTransport): MessageConnection {
  const reader = new StdioMessageReader(transport);
  const writer = new StdioMessageWriter(transport);
  return createMessageConnection(reader, writer);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Parses Content-Length framed JSON-RPC messages out of an incoming byte stream. */
class StdioMessageReader extends AbstractMessageReader {
  private callback: DataCallback | undefined;
  private buffer = new Uint8Array(0);
  // byte offset where the current message's body starts, or -1 if the header of the
  // next message hasn't been fully parsed yet (so it isn't re-scanned per chunk)
  private bodyStart = -1;
  private bodyLength = 0;

  constructor(transport: ByteTransport) {
    super();
    transport.onReceive((bytes) => this.append(bytes));
  }

  override listen(callback: DataCallback): Disposable {
    this.callback = callback;
    this.drain();
    return { dispose: () => this.callback = undefined };
  }

  private append(bytes: Uint8Array) {
    const merged = new Uint8Array(this.buffer.length + bytes.length);
    merged.set(this.buffer);
    merged.set(bytes, this.buffer.length);
    this.buffer = merged;
    this.drain();
  }

  private drain() {
    if (!this.callback) return;
    for (;;) {
      // parse the header once (bytes only), then keep bodyStart/bodyLength until the
      // body arrives — avoids re-decoding the whole (possibly MB) buffer per chunk
      if (this.bodyStart < 0) {
        const headerEnd = indexOfDoubleCrlf(this.buffer);
        if (headerEnd < 0) return; // header incomplete
        const header = decoder.decode(this.buffer.subarray(0, headerEnd));
        const match = /Content-Length:\s*(\d+)/i.exec(header);
        if (match == null) {
          this.fireError(new Error("JSON-RPC message missing Content-Length header"));
          this.buffer = new Uint8Array(0);
          return;
        }
        this.bodyLength = Number(match[1]);
        this.bodyStart = headerEnd + 4; // past the "\r\n\r\n"
      }
      if (this.buffer.length < this.bodyStart + this.bodyLength) return; // body incomplete
      const body = decoder.decode(this.buffer.subarray(this.bodyStart, this.bodyStart + this.bodyLength));
      this.buffer = this.buffer.subarray(this.bodyStart + this.bodyLength);
      this.bodyStart = -1;
      this.bodyLength = 0;
      try {
        this.callback(JSON.parse(body) as Message);
      } catch (err) {
        this.fireError(err);
      }
    }
  }
}

/** Index of the first "\r\n\r\n" (header/body separator) in the buffer, or -1. */
function indexOfDoubleCrlf(buffer: Uint8Array): number {
  for (let i = 0; i + 3 < buffer.length; i++) {
    if (buffer[i] === 13 && buffer[i + 1] === 10 && buffer[i + 2] === 13 && buffer[i + 3] === 10) {
      return i;
    }
  }
  return -1;
}

/** Serializes JSON-RPC messages as Content-Length framed JSON to the byte stream. */
class StdioMessageWriter extends AbstractMessageWriter implements MessageWriter {
  private transport: ByteTransport;

  constructor(transport: ByteTransport) {
    super();
    this.transport = transport;
  }

  write(msg: Message): Promise<void> {
    const body = encoder.encode(JSON.stringify(msg));
    const frame = encoder.encode(`Content-Length: ${body.length}\r\n\r\n`);
    const out = new Uint8Array(frame.length + body.length);
    out.set(frame);
    out.set(body, frame.length);
    this.transport.send(out);
    return Promise.resolve();
  }

  end(): void {}
}
