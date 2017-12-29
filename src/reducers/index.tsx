/* barrel:ignore */
import * as ts from "typescript";
import {AllActions} from "./../actions";
import {StoreState} from "./../types";
import {SET_SELECTED_NODE, SET_SOURCEFILE, SET_POS} from "./../constants";

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
  return state;
}