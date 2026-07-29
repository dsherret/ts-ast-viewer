import { expect } from "@std/expect";
import { Theme } from "../types/index.js";
import type { CompilerApi } from "./CompilerApi.js";
import { convertOptions } from "./convertOptions.js";

function getCompilerApi(scriptTarget: any) {
  return {
    ScriptTarget: scriptTarget,
  } as any as CompilerApi;
}

function doTest(fromTarget: number, expectedTarget: number) {
  // deno-fmt-ignore
  enum ScriptTargetFrom { ES5, Latest, Extra }
  // deno-fmt-ignore
  enum ScriptTargetTo { Latest, ES5 }
  const apiFrom = getCompilerApi(ScriptTargetFrom);
  const apiTo = getCompilerApi(ScriptTargetTo);

  expect(convertOptions(apiFrom, apiTo, {
    compilerPackageName: "typescript-4.4.4" as any,
    scriptTarget: fromTarget,
    treeMode: 0,
    bindingEnabled: true,
    showFactoryCode: true,
    showInternals: false,
    theme: Theme.Dark,
  })).toEqual({
    compilerPackageName: "typescript-4.4.4" as any,
    scriptTarget: expectedTarget,
    treeMode: 0,
    bindingEnabled: true,
    showFactoryCode: true,
    showInternals: false,
    theme: Theme.Dark,
  });
}

Deno.test("should convert between the options when they all exist", () => {
  doTest(0, 1);
});

Deno.test("should convert between the options when they don't exist", () => {
  doTest(2, 0);
});
