import * as ts from "typescript";

export function createSourceFile(code: string) {
    return ts.createSourceFile("ts-ast-viewer.ts", code, ts.ScriptTarget.Latest, false, ts.ScriptKind.Unknown);
}
