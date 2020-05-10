import { CompilerApi, TypeChecker, Program, SourceFile, CompilerOptions, ScriptTarget, ScriptKind, CompilerHost } from "./CompilerApi";
import { assertNever } from "../utils";

export function createSourceFile(api: CompilerApi, code: string, scriptTarget: ScriptTarget, scriptKind: ScriptKind) {
    const filePath = `/ts-ast-viewer${getExtension(api, scriptKind)}`;
    const sourceFile = api.createSourceFile(filePath, code, scriptTarget, false, scriptKind);
    let bindingResult: { typeChecker: TypeChecker; program: Program } | undefined;

    return { sourceFile, bindingTools: getBindingTools };

    // binding may be disabled, so make this deferred
    function getBindingTools() {
        if (bindingResult == null)
            bindingResult = getBindingResult();
        return bindingResult;
    }

    function getBindingResult() {
        const options: CompilerOptions = { strict: true, target: scriptTarget, allowJs: true, module: api.ModuleKind.ES2015 };
        const files: { [name: string]: SourceFile | undefined } = { [filePath]: sourceFile, ...api.tsAstViewer.cachedSourceFiles };

        const compilerHost: CompilerHost = {
            getSourceFile: (fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void) => {
                return files[fileName];
            },
            // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
            // getDefaultLibLocation: (...) => {},
            getDefaultLibFileName: (defaultLibOptions: CompilerOptions) => "/" + api.getDefaultLibFileName(defaultLibOptions),
            writeFile: () => {
                // do nothing
            },
            getCurrentDirectory: () => "/",
            getDirectories: (path: string) => [],
            fileExists: (fileName: string) => files[fileName] != null,
            readFile: (fileName: string) => files[fileName] != null ? files[fileName]!.getFullText() : undefined,
            getCanonicalFileName: (fileName: string) => fileName,
            useCaseSensitiveFileNames: () => true,
            getNewLine: () => "\n",
            getEnvironmentVariable: () => "",
        };
        const program = api.createProgram([...Object.keys(files)], options, compilerHost);
        const typeChecker = program.getTypeChecker();

        return { typeChecker, program };
    }
}

function getExtension(api: CompilerApi, scriptKind: ScriptKind) {
    switch (scriptKind) {
        case api.ScriptKind.TS:
            return ".ts";
        case api.ScriptKind.TSX:
            return ".tsx";
        case api.ScriptKind.JS:
            return ".js";
        case api.ScriptKind.JSX:
            return ".jsx";
        case api.ScriptKind.JSON:
            return ".json";
        case api.ScriptKind.External:
        case api.ScriptKind.Deferred:
        case api.ScriptKind.Unknown:
            return "";
        default:
            return assertNever(scriptKind, `Not implemented ScriptKind: ${api.ScriptKind[scriptKind]}`);
    }
}
