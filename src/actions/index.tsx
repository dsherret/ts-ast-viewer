import type { CompilerApi, Node } from "../compiler/index.js";
import { actions as constants } from "../constants/index.js";
import type { ApiLoadingState, OptionsState } from "../types/index.js";

export interface SetCode {
  type: constants.SET_CODE;
  code: string;
}

export function setCode(code: string): SetCode {
  return {
    type: constants.SET_CODE,
    code,
  };
}

export interface SetApiLoadingState {
  type: constants.SET_API_LOADING_STATE;
  loadingState: ApiLoadingState;
}

export function setApiLoadingState(loadingState: ApiLoadingState): SetApiLoadingState {
  return {
    type: constants.SET_API_LOADING_STATE,
    loadingState,
  };
}

export interface RefreshSourceFile {
  type: constants.REFRESH_SOURCEFILE;
  api: CompilerApi;
}

export function refreshSourceFile(api: CompilerApi): RefreshSourceFile {
  return {
    type: constants.REFRESH_SOURCEFILE,
    api,
  };
}

export interface SetSelectedNode {
  type: constants.SET_SELECTED_NODE;
  node: Node;
}

export function setSelectedNode(node: Node): SetSelectedNode {
  return {
    type: constants.SET_SELECTED_NODE,
    node,
  };
}

export interface SetOptions {
  type: constants.SET_OPTIONS;
  options: Partial<OptionsState>;
}

export function setOptions(options: Partial<OptionsState>): SetOptions {
  return {
    type: constants.SET_OPTIONS,
    options,
  };
}

export interface OsThemeChange {
  type: constants.OS_THEME_CHANGE;
}

export function osThemeChange(): OsThemeChange {
  return {
    type: constants.OS_THEME_CHANGE,
  };
}

export type AllActions =
  | SetCode
  | SetApiLoadingState
  | RefreshSourceFile
  | SetSelectedNode
  | SetOptions
  | OsThemeChange;
