// Boots one of the patched tsgo wasms (see scripts/buildTsgo.ts) as a resident
// `--api --async` JSON-RPC server. JSPI lets a blocking stdin read suspend the wasm
// without a SharedArrayBuffer (no COOP/COEP needed); the inline-handler patch makes
// suspending inside fd_read safe. Source files are delivered via the wasm's in-memory
// filesystem, since an inline handler can't round-trip a server→client FS request.
import { Fd, File, OpenFile, PreopenDirectory, WASI, wasi as wasiDefs } from "@bjorn3/browser_wasi_shim";

const ERRNO_SUCCESS = 0;

export interface BootedTsgo {
  /** Feed bytes to the server's stdin (JSON-RPC requests). */
  writeStdin(bytes: Uint8Array): void;
  /** Update/add a file in the in-memory FS (returns true if newly created). Pair a
   * replacement with `updateSnapshot({ fileChanges: { changed: [path] } })` to re-read it. */
  setFile(path: string, content: string): boolean;
  /** Remove a file from the in-memory FS (returns true if removed). Pair with
   * `updateSnapshot({ fileChanges: { deleted: [path] } })`. */
  removeFile(path: string): boolean;
  /** Resolves if the wasm exits (normally it runs forever). */
  running: Promise<void>;
}

export interface BootTsgoOptions {
  wasmModule: WebAssembly.Module;
  /** Called with each chunk the server writes to stdout (JSON-RPC responses). */
  onStdout: (bytes: Uint8Array) => void;
  onStderr?: (bytes: Uint8Array) => void;
  /** Virtual files exposed to the compiler, keyed by absolute path. */
  files?: Record<string, string>;
  args?: string[];
}

export function jspiAvailable(): boolean {
  return typeof (WebAssembly as unknown as { Suspending?: unknown }).Suspending === "function" &&
    typeof (WebAssembly as unknown as { promising?: unknown }).promising === "function";
}

export async function bootTsgoWasm(options: BootTsgoOptions): Promise<BootedTsgo> {
  if (!jspiAvailable()) {
    throw new Error("WebAssembly JSPI is not available in this environment (required for tsgo support).");
  }

  const rootEntries = new Map<string, File>();
  for (const [filePath, content] of Object.entries(options.files ?? {})) {
    rootEntries.set(filePath.replace(/^\/+/, ""), new File(new TextEncoder().encode(content)));
  }
  const preopen = new PreopenDirectory("/", rootEntries);

  const wasi = new WASI(
    options.args ?? ["tsgo", "--api", "--async", "--cwd", "/"],
    [],
    [
      new OpenFile(new File(new Uint8Array())),
      new SinkFd(options.onStdout),
      new SinkFd(options.onStderr ?? (() => {})),
      preopen,
    ],
    { debug: false },
  );

  const stdin = new StdinQueue();
  const shimFdRead = wasi.wasiImport.fd_read as FdRead;

  // JSPI-suspending fd_read for stdin (fd 0): always returns real bytes, waiting
  // if necessary. Other fds delegate to the shim synchronously.
  const asyncFdRead = async (fd: number, iovsPtr: number, iovsLen: number, nreadPtr: number): Promise<number> => {
    if (fd !== 0) return shimFdRead(fd, iovsPtr, iovsLen, nreadPtr);
    await stdin.waitForData();
    const memory = (wasi.inst!.exports as { memory: WebAssembly.Memory }).memory;
    const view = new DataView(memory.buffer);
    const bytes = new Uint8Array(memory.buffer);
    let nread = 0;
    for (let i = 0; i < iovsLen; i++) {
      const buf = view.getUint32(iovsPtr + i * 8, true);
      const len = view.getUint32(iovsPtr + i * 8 + 4, true);
      if (len === 0 || stdin.isEmpty()) break;
      const chunk = stdin.take(len);
      bytes.set(chunk, buf);
      nread += chunk.length;
      if (chunk.length < len) break;
    }
    new DataView(memory.buffer).setUint32(nreadPtr, nread, true);
    return ERRNO_SUCCESS;
  };

  const Suspending = (WebAssembly as unknown as {
    Suspending: new (fn: (...args: number[]) => Promise<number>) => WebAssembly.ImportValue;
  }).Suspending;
  const promising = (WebAssembly as unknown as {
    promising: (fn: CallableFunction) => () => Promise<number>;
  }).promising;

  const imports = {
    wasi_snapshot_preview1: { ...wasi.wasiImport, fd_read: new Suspending(asyncFdRead) },
  };
  const instance = await WebAssembly.instantiate(options.wasmModule, imports);
  wasi.inst = instance as unknown as typeof wasi.inst;

  const start = promising((instance.exports as { _start: CallableFunction })._start);
  const running = start().then(() => {}).catch((err: unknown) => {
    if (!/WASIProcExit|exit code 0/.test(String((err as Error)?.message))) throw err;
  });

  return { writeStdin: (bytes) => stdin.push(bytes), setFile, removeFile, running };

  function setFile(path: string, content: string): boolean {
    const key = path.replace(/^\/+/, "");
    const bytes = new TextEncoder().encode(content);
    const contents = preopen.dir.contents;
    const existing = contents.get(key);
    if (existing instanceof File) {
      existing.data = bytes;
      return false;
    }
    contents.set(key, new File(bytes));
    return true;
  }

  function removeFile(path: string): boolean {
    return preopen.dir.contents.delete(path.replace(/^\/+/, ""));
  }
}

type FdRead = (fd: number, iovsPtr: number, iovsLen: number, nreadPtr: number) => number;

/** stdout/stderr fd that forwards written bytes to a callback. */
class SinkFd extends Fd {
  private onWrite: (bytes: Uint8Array) => void;
  constructor(onWrite: (bytes: Uint8Array) => void) {
    super();
    this.onWrite = onWrite;
  }
  override fd_write(data: Uint8Array) {
    this.onWrite(data.slice());
    return { ret: ERRNO_SUCCESS, nwritten: data.byteLength };
  }
  override fd_fdstat_get() {
    const fdstat = new wasiDefs.Fdstat(wasiDefs.FILETYPE_CHARACTER_DEVICE, 0);
    (fdstat as unknown as { fs_rights_base: bigint }).fs_rights_base ??= 0n;
    (fdstat as unknown as { fs_rights_inherited: bigint }).fs_rights_inherited ??= 0n;
    return { ret: ERRNO_SUCCESS, fdstat };
  }
}

/** A queue of stdin chunks with async blocking when empty. */
class StdinQueue {
  private chunks: Uint8Array[] = [];
  private waiters: (() => void)[] = [];

  push(bytes: Uint8Array) {
    this.chunks.push(bytes);
    const waiters = this.waiters;
    this.waiters = [];
    for (const resolve of waiters) resolve();
  }

  isEmpty() {
    return this.chunks.length === 0;
  }

  async waitForData() {
    while (this.chunks.length === 0) {
      await new Promise<void>((resolve) => this.waiters.push(resolve));
    }
  }

  take(maxLen: number): Uint8Array {
    const head = this.chunks[0];
    if (head.length <= maxLen) {
      this.chunks.shift();
      return head;
    }
    this.chunks[0] = head.subarray(maxLen);
    return head.subarray(0, maxLen);
  }
}
