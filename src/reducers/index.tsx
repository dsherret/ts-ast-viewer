/* barrel:ignore */
import { AllActions } from "../actions";
import { StoreState, OptionsState } from "../types";
import { Node, createSourceFile, CompilerApi, convertOptions } from "../compiler";
import { SET_SELECTED_NODE, SET_CODE, SET_API_LOADING_STATE, SET_POS, SET_OPTIONS, REFRESH_SOURCEFILE } from "./../constants";

export function appReducer(state: StoreState, action: AllActions): StoreState {
    switch (action.type) {
        case SET_SELECTED_NODE: {
            if (state.compiler == null)
                return state;

            return {
                ...state,
                compiler: {
                    ...state.compiler,
                    selectedNode: action.node
                }
            };
        }
        case SET_API_LOADING_STATE: {
            return {
                ...state,
                apiLoadingState: action.loadingState
            };
        }
        case REFRESH_SOURCEFILE: {
            const newState = {
                ...state,
                options: convertOptions(state.compiler == null ? undefined : state.compiler.api, action.api, state.options)
            };
            fillNewSourceFileState(action.api, newState, state.code, state.options);
            return newState;
        }
        case SET_CODE: {
            return { ...state, code: action.code };
        }
        case SET_POS: {
            if (state.compiler == null)
                return state;

            const pos = action.pos;
            const sourceFile = state.compiler.sourceFile;
            let selectedNode: Node = sourceFile;
            while (true) {
                // todo: should use correct function here (ex. api.forEachChild based on the options)
                const children = selectedNode.getChildren(sourceFile);
                let found = false;
                for (const child of children) {
                    if (child.getStart(sourceFile) <= pos && child.end > pos) {
                        selectedNode = child;
                        found = true;
                        break;
                    }
                }

                if (!found)
                    break;
            }

            //const node = state.sourceFile.
            return {
                ...state,
                compiler: {
                    ...state.compiler,
                    selectedNode
                }
            };
        }
        case SET_OPTIONS: {
            return {
                ...state,
                options: {
                    ...state.options,
                    ...action.options
                }
            };
        }
        default: {
            const assertNever: never = action;
        }
    }
    return state;
}

function fillNewSourceFileState(api: CompilerApi, state: StoreState, code: string, options: OptionsState) {
    const {sourceFile, program, typeChecker} = createSourceFile(api, code, options.scriptTarget, options.scriptKind);
    state.compiler = {
        api,
        sourceFile,
        program,
        typeChecker,
        selectedNode: sourceFile
    };
}
