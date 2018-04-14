import { convertOptions } from "../convertOptions";
import { CompilerApi } from "../CompilerApi";

function getCompilerApi(scriptKind: any, scriptTarget: any) {
    return {
        ScriptKind: scriptKind,
        ScriptTarget: scriptTarget
    } as any as CompilerApi;
}

function doTest(fromKind: number, fromTarget: number, expectedKind: number, expectedTarget: number) {
    enum ScriptKindFrom { TSX, JSX, Extra }
    enum ScriptKindTo { JSX, TSX }
    enum ScriptTargetFrom { ES5, Latest, Extra }
    enum ScriptTargetTo { Latest, ES5 }
    const apiFrom = getCompilerApi(ScriptKindFrom, ScriptTargetFrom);
    const apiTo = getCompilerApi(ScriptKindTo, ScriptTargetTo);

    expect(convertOptions(apiFrom, apiTo, {
        compilerPackageName: "typescript",
        scriptKind: fromKind,
        scriptTarget: fromTarget,
        treeMode: 0
    })).toEqual({
        compilerPackageName: "typescript",
        scriptKind: expectedKind,
        scriptTarget: expectedTarget,
        treeMode: 0
    });
}

it("should convert between the options when they all exist", () => {
    doTest(0, 0, 1, 1);
});

it("should convert between the options when they don't exist", () => {
    doTest(2, 2, 1, 0);
});
