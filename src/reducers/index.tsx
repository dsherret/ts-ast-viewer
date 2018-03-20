/* barrel:ignore */
import ts from "typescript";
import {AllActions} from "../actions";
import {StoreState} from "../types";
import {createSourceFile} from "../helpers";
import {SET_SELECTED_NODE, SET_SOURCEFILE, SET_POS, SET_OPTIONS} from "./../constants";

export function appReducer(state: StoreState, action: AllActions): StoreState {
    switch (action.type) {
        case SET_SELECTED_NODE:
            return {...state, selectedNode: action.node};
        case SET_SOURCEFILE:
            return {...state, sourceFile: action.sourceFile, selectedNode: action.sourceFile};
        case SET_POS:
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
        case SET_OPTIONS: {
            const newState = {...state, options: action.options};
            const fileNeedsChanging = action.options.scriptKind !== state.options.scriptKind
                || action.options.scriptTarget !== state.options.scriptTarget;

            if (fileNeedsChanging) {
                newState.sourceFile = createSourceFile(newState.sourceFile.getFullText(), action.options.scriptTarget, action.options.scriptKind);
                // todo: get the source file based on the previous position (do this when refactoring SET_POS)
                newState.selectedNode = newState.sourceFile;
            }

            return newState;
        }
  }
  return state;
}
