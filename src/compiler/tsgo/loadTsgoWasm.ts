// Lazily fetches and compiles the tsgo WebAssembly module (~49 MB) and installs
// the vscode-jsonrpc browser runtime abstraction layer. Only reached via dynamic
// import when a tsgo version is selected, so neither the wasm nor the browser-only
// RAL are part of the main bundle or the Deno type-check graph.
//
// The wasm is served as a static asset from `public/tsgo.wasm` (built by
// `deno task buildTsgo`) and fetched at runtime — deliberately NOT referenced via
// `new URL(..., import.meta.url)`, so `vite build` doesn't require the 49 MB file
// to exist. Only the scheduled/deploy CI build produces it.
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
      "tsgo needs WebAssembly JSPI, which this browser doesn't support. " +
        "Try a recent Chromium-based browser.",
    );
  }
  await installBrowserRal();
  const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";
  const response = await fetch(base + "tsgo.wasm");
  if (!response.ok) {
    throw new Error(`Failed to fetch tsgo.wasm (${response.status}). It may not have been built for this deployment.`);
  }
  if (typeof WebAssembly.compileStreaming === "function") {
    return WebAssembly.compileStreaming(response);
  }
  return WebAssembly.compile(await response.arrayBuffer());
}
