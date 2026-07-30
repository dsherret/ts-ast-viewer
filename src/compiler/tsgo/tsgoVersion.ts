// Lightweight tsgo identity for the app's static module graph (version selector,
// options, reducer). Must stay free of heavy imports (no wasm/vendored client) so
// selecting another version never pulls in a tsgo wasm — those load dynamically only
// when a tsgo version is chosen. TypeScript 7.0+ is the Go port, built here from
// typescript-go: one build from the latest `main` (the nightly) and one from the most
// recent stable release (see scripts/buildTsgo.ts).
import { type CompilerPackageNames, compilerVersionCollection } from "../compilerVersions.generated.js";
import { TSGO_BUILDS } from "./tsgoBuildInfo.generated.js";
import { toVendorLoader, type TsgoVendor } from "./tsgoVendor.js";

// Internal key prefix for the tsgo compilers (not an npm package name, though the
// release build's key matches the npm package it was built from). The app keys
// everything — loaded APIs, syntax kind names, the selector — by these.
const TSGO_PACKAGE_PREFIX = "@typescript/native-preview@";

export type TsgoPackageName = `${typeof TSGO_PACKAGE_PREFIX}${string}`;

/** Any selectable compiler, including the tsgo builds which aren't npm packages. */
export type AnyCompilerPackageName = CompilerPackageNames | TsgoPackageName;

/** One selectable TypeScript 7.0+ build: a wasm plus the client vendored alongside it. */
export interface TsgoBuild {
  /** Identifies the build across its generated files (`nightly`, `stable`). */
  id: keyof typeof TSGO_BUILDS;
  packageName: TsgoPackageName;
  /** The npm release version, or the typescript-go commit date for the nightly. */
  version: string;
  /** How the version selector names this build. */
  label: string;
  /** This build's wasm in `public/` — content-hashed, so a cached wasm can never be
   * paired with a client built against different exports (see scripts/buildTsgo.ts). */
  wasmFileName: string;
  /** Loads the client vendored from the same commit as `wasmFileName`. */
  importVendor: () => Promise<TsgoVendor>;
}

export const tsgoBuilds: TsgoBuild[] = [
  {
    id: "stable",
    packageName: `${TSGO_PACKAGE_PREFIX}${TSGO_BUILDS.stable.version}`,
    version: TSGO_BUILDS.stable.version,
    label: TSGO_BUILDS.stable.version,
    wasmFileName: TSGO_BUILDS.stable.wasmFileName,
    importVendor: toVendorLoader(() => import("./vendor/stable/mod.ts")),
  },
  {
    id: "nightly",
    packageName: `${TSGO_PACKAGE_PREFIX}nightly`,
    // the nightly has no release version, so it's identified by the date of the
    // typescript-go commit on main it was built from
    version: TSGO_BUILDS.nightly.commitDate,
    label: `nightly (${TSGO_BUILDS.nightly.commitDate})`,
    wasmFileName: TSGO_BUILDS.nightly.wasmFileName,
    importVendor: toVendorLoader(() => import("./vendor/nightly/mod.ts")),
  },
];

/**
 * The version selector's full list: the tsgo release, the npm-installed versions,
 * then the tsgo nightly.
 *
 * The list reads newest to oldest, so the tsgo release goes at the top (though it's
 * not the default selection, see AppContext) and the nightly stays at the very bottom.
 */
export const appCompilerVersions: { packageName: AnyCompilerPackageName; label: string }[] = [
  ...toSelectorItems(tsgoBuilds.filter((build) => build.id !== "nightly")),
  ...compilerVersionCollection.map((v) => ({ packageName: v.packageName, label: v.version })),
  ...toSelectorItems(tsgoBuilds.filter((build) => build.id === "nightly")),
];

/** Whether this compiler runs via the tsgo/wasm infrastructure (vs the npm typescript). */
export function isTsgo(packageName: AnyCompilerPackageName): packageName is TsgoPackageName {
  return packageName.startsWith(TSGO_PACKAGE_PREFIX);
}

export function getTsgoBuild(packageName: TsgoPackageName): TsgoBuild {
  const build = tsgoBuilds.find((build) => build.packageName === packageName);
  if (build == null) {
    throw new Error(`Unknown tsgo build: ${packageName}`);
  }
  return build;
}

function toSelectorItems(builds: TsgoBuild[]) {
  return builds.map((build) => ({ packageName: build.packageName, label: build.label }));
}
