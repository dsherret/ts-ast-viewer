/* barrel:ignore */
import ts from "typescript";
import {AllActions} from "../actions";
import {StoreState, OptionsState} from "../types";
import {createSourceFile} from "../helpers";
import {SET_SELECTED_NODE, SET_CODE, SET_POS, SET_OPTIONS, REFRESH_SOURCEFILE} from "./../constants";

export function appReducer(state: StoreState, action: AllActions): StoreState {
    switch (action.type) {
        case SET_SELECTED_NODE: {
            return {...state, selectedNode: action.node};
        }
        case REFRESH_SOURCEFILE: {
            const newState = {...state};
            fillNewSourceFileState(newState, state.code, state.options);
            newState.selectedNode = newState.sourceFile;
            return newState;
        }
        case SET_CODE: {
            return { ...state, code: action.code };
        }
        case SET_POS: {
            const pos = action.pos;
            let selectedNode: ts.Node = state.sourceFile;
            while (true) {
                // todo: should use correct function here (ex. ts.forEachChild based on the options)
                const children = selectedNode.getChildren(state.sourceFile);
                let found = false;
                for (const child of children) {
                    if (child.getStart(state.sourceFile) <= pos && child.end > pos) {
                        selectedNode = child;
                        found = true;
                        break;
                    }
                }

                if (!found)
                    break;
            }

            //const node = state.sourceFile.
            return {...state, selectedNode };
        }
        case SET_OPTIONS: {
            const newState = {...state, options: action.options};
            const fileNeedsChanging = action.options.scriptKind !== state.options.scriptKind
                || action.options.scriptTarget !== state.options.scriptTarget;

            if (fileNeedsChanging) {
                fillNewSourceFileState(newState, newState.sourceFile.getFullText(), action.options);
                // todo: get the source file based on the previous position (do this when refactoring SET_POS)
                newState.selectedNode = newState.sourceFile;
            }

            return newState;
        }
  }
  return state;
}

function fillNewSourceFileState(state: StoreState, code: string, options: OptionsState) {
    const {sourceFile, program, typeChecker} = createSourceFile(code, options.scriptTarget, options.scriptKind);
    state.sourceFile = sourceFile;
    state.program = program;
    state.typeChecker = typeChecker;
}