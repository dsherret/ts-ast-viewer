import { CompilerApi, ScriptKind } from "../compiler";

export function isTsxScriptKind(compilerApi: CompilerApi, kind: ScriptKind) {
    return kind === compilerApi.ScriptKind.TSX || kind === compilerApi.ScriptKind.JSX;
}
