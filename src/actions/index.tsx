/* barrel:ignore */
import ts from "typescript";
import * as constants from "../constants";
import {OptionsState} from "../types";

export interface SetCode {
    type: constants.SET_CODE;
    code: string;
}

export function setCode(code: string): SetCode {
    return {
        type: constants.SET_CODE,
        code
    };
}

export interface RefreshSourceFile {
    type: constants.REFRESH_SOURCEFILE;
}

export function refreshSourceFile(): RefreshSourceFile {
    return {
        type: constants.REFRESH_SOURCEFILE,
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
    type: constants.SET_POS;
    pos: number;
}

export function setPos(pos: number): SetPos {
    return {
        type: constants.SET_POS,
        pos
    };
}

export interface SetOptions {
    type: constants.SET_OPTIONS;
    options: OptionsState;
}

export function setOptions(options: OptionsState): SetOptions {
    return {
        type: constants.SET_OPTIONS,
        options
    };
}

export type AllActions = SetCode | RefreshSourceFile | SetSelectedNode | SetPos | SetOptions;
