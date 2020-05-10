import { convertOptions } from "../convertOptions";
import { CompilerApi } from "../CompilerApi";

function getCompilerApi(scriptKind: any, scriptTarget: any) {
    return {
        ScriptKind: scriptKind,
        ScriptTarget: scriptTarget,
    } as any as CompilerApi;
}

function doTest(fromKind: number, fromTarget: number, expectedKind: number, expectedTarget: number) {
    // dprint-ignore
    enum ScriptKindFrom { TSX, JSX, Extra }
    // dprint-ignore
    enum ScriptKindTo { JSX, TSX }
    // dprint-ignore
    enum ScriptTargetFrom { ES5, Latest, Extra }
    // dprint-ignore
    enum ScriptTargetTo { Latest, ES5 }
    const apiFrom = getCompilerApi(ScriptKindFrom, ScriptTargetFrom);
    const apiTo = getCompilerApi(ScriptKindTo, ScriptTargetTo);

    expect(convertOptions(apiFrom, apiTo, {
        compilerPackageName: "typescript",
        scriptKind: fromKind,
        scriptTarget: fromTarget,
        treeMode: 0,
        bindingEnabled: true,
        showFactoryCode: true,
        showInternals: false,
    })).toEqual({
        compilerPackageName: "typescript",
        scriptKind: expectedKind,
        scriptTarget: expectedTarget,
        treeMode: 0,
        bindingEnabled: true,
        showFactoryCode: true,
        showInternals: false,
    });
}

it("should convert between the options when they all exist", () => {
    doTest(0, 0, 1, 1);
});

it("should convert between the options when they don't exist", () => {
    doTest(2, 2, 1, 0);
});
