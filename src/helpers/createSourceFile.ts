import * as ts from "typescript";
import {getLibFiles} from "../resources/getLibFiles";

const cachedSourceFiles: { [name: string]: ts.SourceFile | undefined; } = {};
for (const libFile of getLibFiles())
    cachedSourceFiles[libFile.fileName] = ts.createSourceFile(libFile.fileName, libFile.text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

export function createSourceFile(code: string, scriptTarget: ts.ScriptTarget, scriptKind: ts.ScriptKind) {
    const name = `/ts-ast-viewer${getExtension(scriptKind)}`;
    const sourceFile = ts.createSourceFile(name, code, scriptTarget, false, scriptKind);
    const options: ts.CompilerOptions = { strict: true, target: scriptTarget, allowJs: true, module: ts.ModuleKind.ES2015 };
    const files: { [name: string]: ts.SourceFile | undefined; } = { [name]: sourceFile, ...cachedSourceFiles };

    const compilerHost: ts.CompilerHost = {
        getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
            return files[fileName];
        },
        // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
        // getDefaultLibLocation: (...) => {},
        getDefaultLibFileName: (options: ts.CompilerOptions) => "/" + ts.getDefaultLibFileName(options),
        writeFile: (filePath, data, writeByteOrderMark, onError, sourceFiles) => {
            // do nothing
        },
        getCurrentDirectory: () => "/",
        getDirectories: (path: string) => [],
        fileExists: (fileName: string) => files[fileName] != null,
        readFile: (fileName: string) => files[fileName] != null ? files[fileName]!.getFullText() : undefined,
        getCanonicalFileName: (fileName: string) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => "\n",
        getEnvironmentVariable: (name: string) => ""
    };
    const program = ts.createProgram([...Object.keys(files)], options, compilerHost);
    const typeChecker = program.getTypeChecker();

    return {program, typeChecker, sourceFile};
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
