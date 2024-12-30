import { expect } from "@std/expect";
import { Theme } from "../types/index.js";
import type { CompilerApi } from "./CompilerApi.js";
import { convertOptions } from "./convertOptions.js";

function getCompilerApi(scriptKind: any, scriptTarget: any) {
  return {
    ScriptKind: scriptKind,
    ScriptTarget: scriptTarget,
  } as any as CompilerApi;
}

function doTest(fromKind: number, fromTarget: number, expectedKind: number, expectedTarget: number) {
  // deno-fmt-ignore
  enum ScriptKindFrom { TSX, JSX, Extra }
  // deno-fmt-ignore
  enum ScriptKindTo { JSX, TSX }
  // deno-fmt-ignore
  enum ScriptTargetFrom { ES5, Latest, Extra }
  // deno-fmt-ignore
  enum ScriptTargetTo { Latest, ES5 }
  const apiFrom = getCompilerApi(ScriptKindFrom, ScriptTargetFrom);
  const apiTo = getCompilerApi(ScriptKindTo, ScriptTargetTo);

  expect(convertOptions(apiFrom, apiTo, {
    compilerPackageName: "typescript-4.4.4" as any,
    scriptKind: fromKind,
    scriptTarget: fromTarget,
    treeMode: 0,
    bindingEnabled: true,
    showFactoryCode: true,
    showInternals: false,
    theme: Theme.Dark,
  })).toEqual({
    compilerPackageName: "typescript-4.4.4" as any,
    scriptKind: expectedKind,
    scriptTarget: expectedTarget,
    treeMode: 0,
    bindingEnabled: true,
    showFactoryCode: true,
    showInternals: false,
    theme: Theme.Dark,
  });
}

Deno.test("should convert between the options when they all exist", () => {
  doTest(0, 0, 1, 1);
});

Deno.test("should convert between the options when they don't exist", () => {
  doTest(2, 2, 1, 0);
});
