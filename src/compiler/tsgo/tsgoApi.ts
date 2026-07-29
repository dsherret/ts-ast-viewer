// Starts an in-browser tsgo API session: boots a build's wasm (bootTsgoWasm.ts) and
// drives it through the native-preview async client vendored alongside it over a
// JSON-RPC connection (tsgoConnection.ts). The returned api is the full client surface,
// backed by the wasm.
import { bootTsgoWasm } from "./bootTsgoWasm.ts";
import { createStdioConnection } from "./tsgoConnection.ts";
import type { TsgoApi, TsgoVendor } from "./tsgoVendor.ts";

export interface TsgoApiOptions {
  /** The client vendored from the same commit as `wasmModule` (see tsgoVendor.ts). */
  vendor: TsgoVendor;
  wasmModule: WebAssembly.Module;
  /** Virtual files exposed to the compiler, keyed by absolute path. */
  files?: Record<string, string>;
  /** Working directory the server reports; files live under it. Defaults to "/". */
  cwd?: string;
}

export interface TsgoApiHandle {
  api: TsgoApi;
  /** Update/add a file in the compiler's in-memory filesystem (see BootedTsgo.setFile). */
  setFile(path: string, content: string): boolean;
  /** Remove a file from the compiler's in-memory filesystem (see BootedTsgo.removeFile). */
  removeFile(path: string): boolean;
  dispose(): Promise<void>;
}

export async function createTsgoApi(options: TsgoApiOptions): Promise<TsgoApiHandle> {
  let receive: ((bytes: Uint8Array) => void) | undefined;
  const booted = await bootTsgoWasm({
    wasmModule: options.wasmModule,
    files: options.files,
    onStdout: (bytes) => receive?.(bytes),
  });

  const connection = createStdioConnection({
    send: (bytes) => booted.writeStdin(bytes),
    onReceive: (handler) => receive = handler,
  });

  const api = new options.vendor.API({ connection, cwd: options.cwd ?? "/" });

  // The wasm server normally runs forever. If it exits (clean or crash), dispose the
  // connection so in-flight JSON-RPC requests reject instead of hanging — and so a
  // crash doesn't surface as an unhandled promise rejection.
  booted.running.then(
    () => connection.dispose(),
    (err) => {
      console.error("tsgo wasm exited unexpectedly:", err);
      connection.dispose();
    },
  );

  return {
    api,
    setFile: booted.setFile,
    removeFile: booted.removeFile,
    dispose: () => api.close(),
  };
}
