import ts from "typescript";

export function createSourceFile(code: string, scriptTarget: ts.ScriptTarget, scriptKind: ts.ScriptKind) {
    return ts.createSourceFile(`ts-ast-viewer${getExtension(scriptKind)}`, code, scriptTarget, false, scriptKind);
}

function getExtension(scriptKind: ts.ScriptKind) {
    switch (scriptKind) {
        case ts.ScriptKind.TS:
            return ".ts";
        case ts.ScriptKind.TSX:
            return ".tsx";
        case ts.ScriptKind.JS:
            return ".js";
        case ts.ScriptKind.JSX:
            return ".jsx";
        case ts.ScriptKind.JSON:
            return ".json";
        case ts.ScriptKind.External:
        case ts.ScriptKind.Unknown:
            return "";
    }
}
