import * as ts from "typescript";
import * as constants from "./../constants";

export interface SetSourceFile {
    type: constants.SET_SOURCEFILE;
    sourceFile: ts.SourceFile;
}

export function setSourceFile(sourceFile: ts.SourceFile): SetSourceFile {
    return {
        type: constants.SET_SOURCEFILE,
        sourceFile
    };
}

export interface SetSelectedNode {
    type: constants.SET_SELECTED_NODE;
    node: ts.Node;
}

export function setSelectedNode(node: ts.Node): SetSelectedNode {
    return {
        type: constants.SET_SELECTED_NODE,
        node
    };
}

export interface SetPos {
    type: constants.SET_POS,
    pos: number;
}

export function setPos(pos: number): SetPos {
    return {
        type: constants.SET_POS,
        pos
    };
}

export type AllActions = SetSourceFile | SetSelectedNode | SetPos;
