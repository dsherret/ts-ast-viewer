// Lightweight TS7 identity shared with the app's static module graph (version
// selector, options, reducer). It must stay free of heavy imports (no wasm, no
// vendored client) so selecting any other version never pulls in TypeScript 7.0's
// 49 MB wasm — those modules load dynamically only when "7.0" is chosen.
import { type CompilerPackageNames, compilerVersionCollection } from "../compilerVersions.generated.js";

export const TS7_PACKAGE_NAME = "@typescript/native-preview";
export const TS7_VERSION = "7.0";

export type Ts7PackageName = typeof TS7_PACKAGE_NAME;

/** Any selectable compiler, including TS7 which isn't an npm package. */
export type AnyCompilerPackageName = CompilerPackageNames | Ts7PackageName;

export function isTs7(packageName: AnyCompilerPackageName): packageName is Ts7PackageName {
  return packageName === TS7_PACKAGE_NAME;
}

export const ts7VersionEntry: { version: string; packageName: Ts7PackageName } = {
  version: TS7_VERSION,
  packageName: TS7_PACKAGE_NAME,
};

/** The version selector's full list: the npm-installed versions plus TS7. */
export const appCompilerVersions: { version: string; packageName: AnyCompilerPackageName }[] = [
  ...compilerVersionCollection,
  ts7VersionEntry,
];
