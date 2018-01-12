import ts from "typescript";

export function createSourceFile(code: string) {
    return ts.createSourceFile("ts-ast-viewer.tsx", code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
}
