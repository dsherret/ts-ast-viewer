// Bridges vscode-jsonrpc to a byte-oriented stdio transport (the tsgo wasm's
// stdin/stdout under JSPI). The vendored async API client speaks vscode-jsonrpc
// `MessageConnection`; the wasm speaks LSP-style Content-Length framed JSON over
// stdin/stdout. These reader/writer adapters translate between the two.
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
  #callback: DataCallback | undefined;
  #buffer = new Uint8Array(0);

  constructor(transport: ByteTransport) {
    super();
    transport.onReceive((bytes) => this.#append(bytes));
  }

  override listen(callback: DataCallback): Disposable {
    this.#callback = callback;
    this.#drain();
    return { dispose: () => this.#callback = undefined };
  }

  #append(bytes: Uint8Array) {
    const merged = new Uint8Array(this.#buffer.length + bytes.length);
    merged.set(this.#buffer);
    merged.set(bytes, this.#buffer.length);
    this.#buffer = merged;
    this.#drain();
  }

  #drain() {
    if (!this.#callback) return;
    for (;;) {
      const header = /Content-Length: (\d+)\r\n\r\n/.exec(decoder.decode(this.#buffer));
      if (!header) return;
      const bodyStart = header.index + header[0].length;
      const bodyLength = Number(header[1]);
      if (this.#buffer.length < bodyStart + bodyLength) return;
      const body = decoder.decode(this.#buffer.subarray(bodyStart, bodyStart + bodyLength));
      this.#buffer = this.#buffer.subarray(bodyStart + bodyLength);
      try {
        this.#callback(JSON.parse(body) as Message);
      } catch (err) {
        this.fireError(err);
      }
    }
  }
}

/** Serializes JSON-RPC messages as Content-Length framed JSON to the byte stream. */
class StdioMessageWriter extends AbstractMessageWriter implements MessageWriter {
  #transport: ByteTransport;

  constructor(transport: ByteTransport) {
    super();
    this.#transport = transport;
  }

  write(msg: Message): Promise<void> {
    const body = encoder.encode(JSON.stringify(msg));
    const frame = encoder.encode(`Content-Length: ${body.length}\r\n\r\n`);
    const out = new Uint8Array(frame.length + body.length);
    out.set(frame);
    out.set(body, frame.length);
    this.#transport.send(out);
    return Promise.resolve();
  }

  end(): void {}
}
