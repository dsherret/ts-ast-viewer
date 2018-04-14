/* barrel:ignore */
import { CompilerApi, Program, TypeChecker, SourceFile, Node, ScriptTarget, ScriptKind, compilerPackageNames } from "../compiler";

export interface StoreState {
    code: string;
    options: OptionsState;
    apiLoadingState: ApiLoadingState;
    compiler: CompilerState | undefined;
}

export interface CompilerState {
    api: CompilerApi;
    program: Program;
    typeChecker: TypeChecker;
    sourceFile: SourceFile;
    selectedNode: Node;
}

export interface OptionsState {
    compilerPackageName: compilerPackageNames;
    treeMode: TreeMode;
    scriptTarget: ScriptTarget;
    scriptKind: ScriptKind;
}

export enum TreeMode {
    getChildren,
    forEachChild
}

export enum ApiLoadingState {
    Loading,
    Loaded,
    Error
}
