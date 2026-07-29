// Lightweight tsgo identity shared with the app's static module graph (version
// selector, options, reducer). It must stay free of heavy imports (no wasm, no
// vendored client) so selecting any other version never pulls in the ~49 MB tsgo
// wasm — those modules load dynamically only when a tsgo version is chosen.
//
// TypeScript 7.0+ is the native Go port (tsgo); the app runs it from WebAssembly
// instead of an npm package. The nightly ("@next") tracks typescript-go `main`.
import { type CompilerPackageNames, compilerVersionCollection } from "../compilerVersions.generated.js";

// Internal key for the tsgo compiler (not an npm package name). This matches the
// identity the typescript-go source uses; the app keys everything by it.
export const TSGO_PACKAGE_NAME = "@typescript/native-preview";
export const TSGO_VERSION = "@next";

export type TsgoPackageName = typeof TSGO_PACKAGE_NAME;

/** Any selectable compiler, including tsgo which isn't an npm package. */
export type AnyCompilerPackageName = CompilerPackageNames | TsgoPackageName;

/** Whether this compiler runs via the tsgo/wasm infrastructure (vs the npm typescript). */
export function isTsgo(packageName: AnyCompilerPackageName): packageName is TsgoPackageName {
  return packageName === TSGO_PACKAGE_NAME;
}

export const tsgoVersionEntry: { version: string; packageName: TsgoPackageName } = {
  version: TSGO_VERSION,
  packageName: TSGO_PACKAGE_NAME,
};

/** The version selector's full list: the npm-installed versions plus the tsgo nightly. */
export const appCompilerVersions: { version: string; packageName: AnyCompilerPackageName }[] = [
  ...compilerVersionCollection,
  tsgoVersionEntry,
];
