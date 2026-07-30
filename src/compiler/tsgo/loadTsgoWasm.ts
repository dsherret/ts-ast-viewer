// Lazily fetches and compiles a tsgo WebAssembly module. Only reached via dynamic import
// when a tsgo version is selected, so the wasm never lands in the main bundle or the Deno
// type-check graph. Each build's wasm is fetched from `public/` at runtime (not
// `new URL(..., import.meta.url)`), so `vite build` doesn't require the files.
import type { TsgoBuild } from "./tsgoVersion.ts";

// Only the most recently selected build's module is kept: a compiled tsgo module is
// large, and switching versions tears down the other build's session anyway. Switching
// back recompiles, but its wasm comes from the browser's cache.
let compiled: { wasmFileName: string; modulePromise: Promise<WebAssembly.Module> } | undefined;

/** Compile a build's wasm module once, reusing the result across its sessions. */
export function getTsgoWasmModule(build: TsgoBuild): Promise<WebAssembly.Module> {
  if (compiled?.wasmFileName !== build.wasmFileName) {
    const entry = { wasmFileName: build.wasmFileName, modulePromise: compile(build.wasmFileName) };
    compiled = entry;
    // a failed fetch/compile shouldn't be cached, so selecting the version again retries
    entry.modulePromise.catch(() => {
      if (compiled === entry) {
        compiled = undefined;
      }
    });
  }
  return compiled.modulePromise;
}

async function compile(wasmFileName: string): Promise<WebAssembly.Module> {
  const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";
  const response = await fetch(base + wasmFileName);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${wasmFileName} (${response.status}). It may not have been built for this deployment.`,
    );
  }
  if (typeof WebAssembly.compileStreaming === "function") {
    return WebAssembly.compileStreaming(response);
  }
  return WebAssembly.compile(await response.arrayBuffer());
}
