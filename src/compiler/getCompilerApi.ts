import { importCompilerApi, importLibFiles } from "./compiler.generated.js";
import type { CompilerApi } from "./CompilerApi.js";
import type { CompilerPackageNames } from "./compilerVersions.generated.js";
import { type AnyCompilerPackageName, getTsgoBuild, isTsgo, type TsgoPackageName } from "./tsgo/tsgoVersion.js";

const compilerTypes: { [name: string]: Promise<CompilerApi> } = {};
const compilerTypesLoaded: { [name: string]: true } = {};

export function getCompilerApi(packageName: AnyCompilerPackageName): Promise<CompilerApi> {
  if (compilerTypes[packageName] == null) {
    compilerTypes[packageName] = isTsgo(packageName) ? loadTsgoCompilerApi(packageName) : loadCompilerApi(packageName);
    compilerTypes[packageName].catch(() => delete compilerTypes[packageName]);
  }
  return compilerTypes[packageName];
}

export function hasLoadedCompilerApi(packageName: AnyCompilerPackageName) {
  return compilerTypesLoaded[packageName] === true;
}

// dynamically imported so a TSGO build's vendored client + wasm loader stay out of the
// main bundle and the Deno type-check graph until a 7.0+ version is actually selected.
async function loadTsgoCompilerApi(packageName: TsgoPackageName): Promise<CompilerApi> {
  const build = getTsgoBuild(packageName);
  const { createTsgoCompilerApi } = await import("./tsgo/tsgoCompiler.js");
  const { getTsgoWasmModule } = await import("./tsgo/loadTsgoWasm.js");
  const vendor = await build.importVendor();
  await getTsgoWasmModule(build); // warm the wasm compile so the first source file is fast
  compilerTypesLoaded[packageName] = true;
  return createTsgoCompilerApi(vendor, build);
}

async function loadCompilerApi(packageName: CompilerPackageNames) {
  const libFilesPromise = importLibFiles(packageName);
  const compilerApiPromise = importCompilerApi(packageName);
  const api = { ...await compilerApiPromise as any as CompilerApi };

  api.tsAstViewer = {
    packageName,
    cachedSourceFiles: {},
  };
  const libFiles = await libFilesPromise;

  for (const sourceFile of getLibSourceFiles()) {
    api.tsAstViewer.cachedSourceFiles[sourceFile.fileName] = sourceFile;
  }

  compilerTypesLoaded[packageName] = true;

  return api;

  function getLibSourceFiles() {
    return Object.keys(libFiles)
      .map((key) => (libFiles as any)[key] as { fileName: string; text: string })
      .map((libFile) => api.createSourceFile(libFile.fileName, libFile.text, api.ScriptTarget.Latest, false));
  }
}
