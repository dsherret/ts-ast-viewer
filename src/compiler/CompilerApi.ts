import * as ts from "typescript";
import { compilerPackageNames } from "./compilerVersions";

export interface CompilerApi {
    createSourceFile: typeof ts.createSourceFile;
    createProgram: typeof ts.createProgram;
    getDefaultLibFileName: typeof ts.getDefaultLibFileName;
    forEachChild: typeof ts.forEachChild;
    ScriptTarget: typeof ts.ScriptTarget;
    ScriptKind: typeof ts.ScriptKind;
    SyntaxKind: typeof ts.SyntaxKind;
    ModuleKind: typeof ts.ModuleKind;
    tsAstViewer: {
        packageName: compilerPackageNames;
        cachedSourceFiles: { [name: string]: SourceFile | undefined; };
    };
}

export type Node = ts.Node;
export type Type = ts.Type;
export type SourceFile = ts.SourceFile;
export type Symbol = ts.Symbol;
export type Program = ts.Program;
export type TypeChecker = ts.TypeChecker;
export type CompilerOptions = ts.CompilerOptions;
export type ScriptTarget = ts.ScriptTarget;
export type ScriptKind = ts.ScriptKind;
export type SyntaxKind = ts.SyntaxKind;
export type CompilerHost = ts.CompilerHost;
