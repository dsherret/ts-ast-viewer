/* barrel:ignore */
import ts from "typescript";

export interface StoreState {
    sourceFile: ts.SourceFile;
    selectedNode: ts.Node;
    options: OptionsState;
}

export interface OptionsState {
    treeMode: TreeMode;
    scriptTarget: ts.ScriptTarget;
    scriptKind: ts.ScriptKind;
}

export enum TreeMode {
    getChildren,
    forEachChild
}
