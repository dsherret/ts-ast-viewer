import { AllActions } from "../actions";
import { CompilerApi, CompilerPackageNames, convertOptions, createSourceFile } from "../compiler";
import { actions as actionNames } from "./../constants";
import { OptionsState, StoreState } from "../types";
import { UrlSaver } from "../utils";

const urlSaver = new UrlSaver();

export function appReducer(state: StoreState, action: AllActions): StoreState {
    switch (action.type) {
        case actionNames.SET_SELECTED_NODE: {
            if (state.compiler == null)
                return state;

            return {
                ...state,
                compiler: {
                    ...state.compiler,
                    selectedNode: action.node,
                },
            };
        }
        case actionNames.SET_API_LOADING_STATE: {
            return {
                ...state,
                apiLoadingState: action.loadingState,
            };
        }
        case actionNames.REFRESH_SOURCEFILE: {
            const newState = {
                ...state,
                options: convertOptions(state.compiler == null ? undefined : state.compiler.api, action.api, state.options),
            };
            fillNewSourceFileState(newState.options.compilerPackageName, action.api, newState, state.code, state.options);
            urlSaver.updateUrl(state.code);
            return newState;
        }
        case actionNames.SET_CODE: {
            return { ...state, code: action.code };
        }
        case actionNames.SET_OPTIONS: {
            return {
                ...state,
                options: {
                    ...state.options,
                    ...action.options,
                },
            };
        }
        default: {
            // eslint-disable-next-line
            const assertNever: never = action;
            return state;
        }
    }
}

function fillNewSourceFileState(compilerPackageName: CompilerPackageNames, api: CompilerApi, state: StoreState, code: string, options: OptionsState) {
    const { sourceFile, bindingTools } = createSourceFile(api, code, options.scriptTarget, options.scriptKind);
    state.compiler = {
        packageName: compilerPackageName,
        api,
        sourceFile,
        bindingTools,
        selectedNode: sourceFile,
    };
}
