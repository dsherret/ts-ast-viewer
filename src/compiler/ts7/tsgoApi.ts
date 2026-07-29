// Starts an in-browser TypeScript 7.0 (tsgo) API session: boots tsgo.wasm as a
// resident `--api --async` server (see bootTsgoWasm.ts) and drives it through the
// vendored native-preview async client over a JSON-RPC connection (tsgoConnection.ts).
// The returned `API` is the full native-preview surface — updateSnapshot, projects,
// program.getSourceFile, and the async checker — backed entirely by the wasm.
import { API } from "./vendor/native-preview/api/async/api.ts";
import { bootTsgoWasm } from "./bootTsgoWasm.ts";
import { createStdioConnection } from "./tsgoConnection.ts";

export { API };

export interface TsgoApiOptions {
  wasmModule: WebAssembly.Module;
  /** Virtual files exposed to the compiler, keyed by absolute path. */
  files?: Record<string, string>;
  /** Working directory the server reports; files live under it. Defaults to "/". */
  cwd?: string;
}

export interface TsgoApiHandle {
  api: API;
  /** Update/add a file in the compiler's in-memory filesystem (see BootedTsgo.setFile). */
  setFile(path: string, content: string): boolean;
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

  const api = new API({ connection, cwd: options.cwd ?? "/" });
  return {
    api,
    setFile: booted.setFile,
    dispose: () => api.close(),
  };
}
