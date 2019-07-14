import { AllActions } from "../actions";
import { StoreState, OptionsState, TreeMode } from "../types";
import { Node, SourceFile, createSourceFile, CompilerApi, convertOptions, getChildrenFunction, CompilerPackageNames } from "../compiler";
import { actions as actionNames } from "./../constants";

export function appReducer(state: StoreState | undefined, action: AllActions): StoreState {
    if (state == null)
        throw new Error("State was undefined. Ensure it never is.");

    switch (action.type) {
        case actionNames.SET_SELECTED_NODE: {
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
        case actionNames.SET_API_LOADING_STATE: {
            return {
                ...state,
                apiLoadingState: action.loadingState
            };
        }
        case actionNames.REFRESH_SOURCEFILE: {
            const newState = {
                ...state,
                options: convertOptions(state.compiler == null ? undefined : state.compiler.api, action.api, state.options)
            };
            fillNewSourceFileState(action.compilerPackageName, action.api, newState, state.code, state.options);
            return newState;
        }
        case actionNames.SET_CODE: {
            return { ...state, code: action.code };
        }
        case actionNames.SET_RANGE: {
            if (state.compiler == null)
                return state;

            const range = action.range;
            const sourceFile = state.compiler.sourceFile;

            const selectedNode = getDescendantAtRange(state.options.treeMode, sourceFile, range) || state.compiler.selectedNode;

            return {
                ...state,
                compiler: {
                    ...state.compiler,
                    selectedNode
                }
            };
        }
        case actionNames.SET_OPTIONS: {
            return {
                ...state,
                options: {
                    ...state.options,
                    ...action.options
                }
            };
        }
        default: {
            // eslint-disable-next-line
            const assertNever: never = action;
            return state;
        }
    }

    function getDescendantAtRange(mode: TreeMode, sourceFile: SourceFile, range: [number, number]) {
        const getChildren = getChildrenFunction(mode, sourceFile);
        const syntaxKinds = state!.compiler!.api.SyntaxKind;

        let bestMatch: { node: Node; start: number; } = { node: sourceFile, start: sourceFile.getStart(sourceFile) };
        searchDescendants(sourceFile);
        return bestMatch.node;

        function searchDescendants(node: Node) {
            const children = getChildren(node);
            for (const child of children) {
                if (isBeforeRange(child.end))
                    continue;

                const isChildSyntaxList = child.kind === syntaxKinds.SyntaxList;
                const childStart = child.getStart(sourceFile);

                if (isAfterRange(childStart))
                    return;

                const hasSameStart = bestMatch.start === childStart && range[0] === childStart;
                if (!isChildSyntaxList && !hasSameStart)
                    bestMatch = { node: child, start: childStart };

                searchDescendants(child);
            }
        }

        function isBeforeRange(pos: number) {
            return pos < range[0];
        }

        function isAfterRange(nodeEnd: number) {
            return nodeEnd >= range[0] && nodeEnd > range[1];
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
        selectedNode: sourceFile
    };
}
