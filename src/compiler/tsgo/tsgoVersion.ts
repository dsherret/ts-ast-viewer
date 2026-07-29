// Lightweight tsgo identity for the app's static module graph (version selector,
// options, reducer). Must stay free of heavy imports (no wasm/vendored client) so
// selecting another version never pulls in the tsgo wasm — those load dynamically
// only when tsgo is chosen. TypeScript 7.0+ is the Go port, built here from main.
import { type CompilerPackageNames, compilerVersionCollection } from "../compilerVersions.generated.js";
import { TSGO_COMMIT_DATE } from "./tsgoBuildInfo.generated.js";

// Internal key for the tsgo compiler (not an npm package name). This matches the
// identity the typescript-go source uses; the app keys everything by it.
export const TSGO_PACKAGE_NAME = "@typescript/native-preview";
// typescript-go publishes no version to select, so identify the build by the date of the
// typescript-go commit on main it was built from (see scripts/buildTsgo.ts).
export const TSGO_VERSION = TSGO_COMMIT_DATE;

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
