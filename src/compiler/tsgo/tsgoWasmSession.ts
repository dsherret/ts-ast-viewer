// Instantiates a tsgo reactor wasm (see scripts/tsgoReactor/main.go) and drives it
// synchronously. The reactor runs one request to completion per call, so there is no
// transport, no JSON-RPC framing and no JSPI — `requestSync` is a plain function call
// that returns the response.
//
// Instantiation is the one asynchronous step, and it has to be: V8 refuses
// `new WebAssembly.Instance` above 8MB on the main thread, and these modules are ~40MB.
// `WebAssembly.instantiate` has no such limit, so the module is instantiated up front
// (from `getCompilerApi`) and every call after that is synchronous — which is what lets
// the app's checker be synchronous on the main thread.
import { WASI } from "@bjorn3/browser_wasi_shim";

/** A running reactor: the synchronous request channel plus its in-memory filesystem. */
export interface TsgoWasmSession {
  /** Send a request whose response is JSON (or empty). Throws on a server error. */
  requestSync(method: string, payloadJson: string): string;
  /** Send a request whose response is the msgpack node encoding. */
  requestBinarySync(method: string, payload: Uint8Array): Uint8Array;
  /** Write a file into the compiler's in-memory filesystem. Pair with an
   * `updateSnapshot` `fileChanges.changed` entry so the session re-reads it. */
  setFile(path: string, content: string): void;
  /** Remove a file from the compiler's in-memory filesystem. */
  removeFile(path: string): void;
  close(): void;
  /** Byte counts for the most recent request, for the client's timing collector. */
  lastBytesSent: number;
  lastBytesReceived: number;
}

export interface TsgoWasmSessionOptions {
  wasmModule: WebAssembly.Module;
  /** Working directory the compiler resolves against. Defaults to "/". */
  cwd?: string;
}

/** The reactor's exports (see the //go:wasmexport functions in main.go). */
interface ReactorExports {
  memory: WebAssembly.Memory;
  _initialize(): void;
  create_session(ptr: number, len: number): number;
  close_session(): void;
  get_request_buffer(size: number): number;
  handle_request(methodLen: number, payloadLen: number): number;
  set_file(pathLen: number, contentLen: number): number;
  remove_file(pathLen: number): number;
  response_ptr(): number;
  response_len(): number;
  response_is_binary(): number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function createTsgoWasmSession(options: TsgoWasmSessionOptions): Promise<TsgoWasmSession> {
  // The reactor's filesystem lives inside the module, so WASI is only here because
  // `GOOS=wasip1` makes the Go runtime import it — no preopened directories, and the
  // fds are just somewhere for a Go panic to be written.
  const wasi = new WASI([], [], [], { debug: false });

  // `WebAssembly.instantiate` rather than `new WebAssembly.Instance`: see the note above.
  const instance = await WebAssembly.instantiate(options.wasmModule, {
    wasi_snapshot_preview1: wasi.wasiImport,
  });
  wasi.initialize(instance as unknown as Parameters<WASI["initialize"]>[0]);

  const exports = instance.exports as unknown as ReactorExports;
  assertReactor(exports);
  const session = new ReactorSession(exports);
  session.createSession(options.cwd ?? "/");
  return session;
}

/**
 * Fail with the missing export named, rather than `undefined is not a function` several
 * calls later. Reaching this means the wasm and the client disagree about the module's
 * shape — which the content-hashed file name is meant to make impossible, so it's a
 * broken deployment rather than a stale cache.
 */
function assertReactor(exports: ReactorExports): void {
  const required = ["_initialize", "create_session", "get_request_buffer", "handle_request", "response_ptr"] as const;
  const missing = required.filter((name) => typeof exports[name] !== "function");
  if (missing.length > 0) {
    throw new Error(
      `This tsgo wasm isn't a reactor build — it's missing ${missing.join(", ")}. ` +
        `The wasm and the app were built from different sources.`,
    );
  }
}

class ReactorSession implements TsgoWasmSession {
  lastBytesSent = 0;
  lastBytesReceived = 0;
  private closed = false;

  constructor(private readonly exports: ReactorExports) {
  }

  createSession(cwd: string): void {
    const payload = encoder.encode(JSON.stringify({ cwd }));
    this.writeRequest(payload);
    if (this.exports.create_session(this.requestPtr, payload.length) !== 0) {
      throw new Error(`tsgo failed to create a session: ${this.readResponseText()}`);
    }
  }

  requestSync(method: string, payloadJson: string): string {
    this.call(method, encoder.encode(payloadJson));
    return this.readResponseText();
  }

  requestBinarySync(method: string, payload: Uint8Array): Uint8Array {
    this.call(method, payload);
    return this.readResponseBytes();
  }

  setFile(path: string, content: string): void {
    const pathBytes = encoder.encode(path);
    const contentBytes = encoder.encode(content);
    this.writeRequest(pathBytes, contentBytes);
    if (this.exports.set_file(pathBytes.length, contentBytes.length) !== 0) {
      throw new Error(`tsgo failed to write ${path}: ${this.readResponseText()}`);
    }
  }

  removeFile(path: string): void {
    const pathBytes = encoder.encode(path);
    this.writeRequest(pathBytes);
    if (this.exports.remove_file(pathBytes.length) !== 0) {
      throw new Error(`tsgo failed to remove ${path}: ${this.readResponseText()}`);
    }
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.exports.close_session();
  }

  /** Offset of the request buffer as of the last `writeRequest`. */
  private requestPtr = 0;

  private call(method: string, payload: Uint8Array): void {
    if (this.closed) {
      throw new Error("the tsgo session is closed");
    }
    const methodBytes = encoder.encode(method);
    this.writeRequest(methodBytes, payload);
    this.lastBytesSent = payload.length;
    if (this.exports.handle_request(methodBytes.length, payload.length) !== 0) {
      throw new Error(`tsgo request "${method}" failed: ${this.readResponseText()}`);
    }
    this.lastBytesReceived = this.exports.response_len();
  }

  /** Copy one or two byte runs into the module's shared request buffer, back to back. */
  private writeRequest(first: Uint8Array, second?: Uint8Array): void {
    const total = first.length + (second?.length ?? 0);
    // grows the wasm memory when needed, which detaches every existing view — so the
    // buffer is always taken fresh, after the call rather than before
    this.requestPtr = this.exports.get_request_buffer(total);
    const memory = new Uint8Array(this.exports.memory.buffer);
    memory.set(first, this.requestPtr);
    if (second != null) {
      memory.set(second, this.requestPtr + first.length);
    }
  }

  private readResponseText(): string {
    const length = this.exports.response_len();
    if (length === 0) return "";
    return decoder.decode(this.responseView(length));
  }

  private readResponseBytes(): Uint8Array {
    const length = this.exports.response_len();
    // copied out: the view points into wasm memory, which the next request overwrites
    return length === 0 ? new Uint8Array(0) : this.responseView(length).slice();
  }

  private responseView(length: number): Uint8Array {
    return new Uint8Array(this.exports.memory.buffer, this.exports.response_ptr(), length);
  }
}
