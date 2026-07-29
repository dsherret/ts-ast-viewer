import { importCompilerApi, importLibFiles } from "./compiler.generated.js";
import type { CompilerApi } from "./CompilerApi.js";
import type { CompilerPackageNames } from "./compilerVersions.generated.js";
import { type AnyCompilerPackageName, isTs7, TS7_VERSION } from "./ts7/ts7Version.js";

const compilerTypes: { [name: string]: Promise<CompilerApi> } = {};
const compilerTypesLoaded: { [name: string]: true } = {};

export function getCompilerApi(packageName: AnyCompilerPackageName): Promise<CompilerApi> {
  if (compilerTypes[packageName] == null) {
    compilerTypes[packageName] = isTs7(packageName) ? loadTs7CompilerApi() : loadCompilerApi(packageName);
    compilerTypes[packageName].catch(() => delete compilerTypes[packageName]);
  }
  return compilerTypes[packageName];
}

export function hasLoadedCompilerApi(packageName: AnyCompilerPackageName) {
  return compilerTypesLoaded[packageName] === true;
}

// dynamically imported so TS7's vendored client + wasm loader stay out of the main
// bundle and the Deno type-check graph until "7.0" is actually selected.
async function loadTs7CompilerApi(): Promise<CompilerApi> {
  const { createTs7CompilerApi, TS7_PACKAGE_NAME } = await import("./ts7/ts7Compiler.js");
  const { getTsgoWasmModule } = await import("./ts7/loadTsgoWasm.js");
  await getTsgoWasmModule(); // warm the wasm compile so the first source file is fast
  compilerTypesLoaded[TS7_PACKAGE_NAME] = true;
  return createTs7CompilerApi(TS7_VERSION);
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
      .map((libFile) =>
        api.createSourceFile(libFile.fileName, libFile.text, api.ScriptTarget.Latest, false, api.ScriptKind.TS)
      );
  }
}
