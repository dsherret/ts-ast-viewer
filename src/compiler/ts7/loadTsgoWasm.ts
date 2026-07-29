// Lazily fetches and compiles the tsgo WebAssembly module (~49 MB) and installs
// the vscode-jsonrpc browser runtime abstraction layer. Only reached via dynamic
// import when "7.0" is selected, so neither the wasm nor the browser-only RAL are
// part of the main bundle or the Deno type-check graph.
//
// The wasm URL uses `new URL(..., import.meta.url)` so Vite fingerprints and serves
// it as an asset that is fetched on demand (not inlined).
import { jspiAvailable } from "./bootTsgoWasm.ts";

let modulePromise: Promise<WebAssembly.Module> | undefined;
let ralInstalled: Promise<unknown> | undefined;

export { jspiAvailable };

/** Compile the tsgo wasm module once, reusing the result across sessions. */
export function getTsgoWasmModule(): Promise<WebAssembly.Module> {
  return modulePromise ??= compile();
}

/** Install the vscode-jsonrpc runtime abstraction layer for the browser once. */
export function installBrowserRal(): Promise<unknown> {
  return ralInstalled ??= import("vscode-jsonrpc/browser");
}

async function compile(): Promise<WebAssembly.Module> {
  if (!jspiAvailable()) {
    throw new Error(
      "TypeScript 7.0 needs WebAssembly JSPI, which this browser doesn't support. " +
        "Try a recent Chromium-based browser.",
    );
  }
  await installBrowserRal();
  const url = new URL("../../resources/tsgo/tsgo.wasm", import.meta.url);
  const response = await fetch(url);
  if (typeof WebAssembly.compileStreaming === "function") {
    return WebAssembly.compileStreaming(response);
  }
  return WebAssembly.compile(await response.arrayBuffer());
}
