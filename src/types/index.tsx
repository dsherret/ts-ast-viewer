import { CompilerApi, Program, TypeChecker, SourceFile, Node, ScriptTarget, ScriptKind, CompilerPackageNames } from "../compiler";

export interface StoreState {
    code: string;
    options: OptionsState;
    apiLoadingState: ApiLoadingState;
    compiler: CompilerState | undefined;
}

export interface CompilerState {
    packageName: CompilerPackageNames;
    api: CompilerApi;
    sourceFile: SourceFile;
    selectedNode: Node;
    // this is deferred because binding may be disabled
    bindingTools: () => BindingTools;
}

export interface BindingTools {
    program: Program;
    typeChecker: TypeChecker;
}

export interface OptionsState {
    compilerPackageName: CompilerPackageNames;
    treeMode: TreeMode;
    scriptTarget: ScriptTarget;
    scriptKind: ScriptKind;
    bindingEnabled: boolean;
    showFactoryCode: boolean;
    showInternals: boolean;
}

export enum TreeMode {
    forEachChild,
    getChildren,
}

export enum ApiLoadingState {
    Loading,
    Loaded,
    Error,
}
