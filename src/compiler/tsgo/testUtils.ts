// Shared plumbing for the tsgo tests, which run each selectable build (nightly, stable)
// against the wasm it was built with. Both wasms are gitignored build outputs, so a test
// skips when its build hasn't been made yet (`deno task buildTsgo`).
import * as path from "node:path";
import type { TsgoBuild } from "./tsgoVersion.ts";

export { tsgoBuilds } from "./tsgoVersion.ts";

export function getTsgoWasmPath(build: TsgoBuild): string {
  return path.resolve(import.meta.dirname!, "../../../public", build.wasmFileName);
}

/** Compile a build's wasm, or `undefined` when it hasn't been built. */
export async function compileTsgoWasm(build: TsgoBuild): Promise<WebAssembly.Module | undefined> {
  const wasmPath = getTsgoWasmPath(build);
  const bytes = await readFileOrUndefined(wasmPath);
  if (bytes == null) {
    console.warn(`skipping: ${wasmPath} not built (run \`deno task buildTsgo\`)`);
    return undefined;
  }
  return await WebAssembly.compile(bytes);
}

async function readFileOrUndefined(filePath: string) {
  try {
    return await Deno.readFile(filePath);
  } catch {
    return undefined;
  }
}
