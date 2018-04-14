import { connect, Dispatch } from 'react-redux';
import { Node, CompilerApi, getCompilerApi, hasLoadedCompilerApi, compilerPackageNames } from "./compiler";
import App from "./App";
import * as actions from "./actions";
import { StoreState, OptionsState, ApiLoadingState } from "./types";
import { debounce } from "./utils";

export function mapStateToProps(state: StoreState) {
    return {
        ...state
    };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AllActions>) {
    const debouncedSourceFileRefresh = debounce<compilerPackageNames>(compilerPackageName => updateSourceFile(compilerPackageName), 150);

    updateSourceFile("typescript");

    return {
        onCodeChange: (compilerPackageName: compilerPackageNames, code: string) => {
            dispatch(actions.setCode(code))
            debouncedSourceFileRefresh(compilerPackageName);
        },
        onPosChange: (pos: number) => dispatch(actions.setPos(pos)),
        onNodeChange: (node: Node) => dispatch(actions.setSelectedNode(node)),
        onOptionsChange: (compilerPackageName: compilerPackageNames, options: Partial<OptionsState>) => {
            const fileNeedsChanging = options.scriptKind !== undefined || options.scriptTarget !== undefined || options.compilerPackageName !== undefined;
            dispatch(actions.setOptions(options));
            if (fileNeedsChanging)
                debouncedSourceFileRefresh(compilerPackageName);
        }
    };

    async function updateSourceFile(compilerPackageName: compilerPackageNames) {
        const changeLoadingState = !hasLoadedCompilerApi(compilerPackageName);
        try {
            if (changeLoadingState)
                dispatch(actions.setApiLoadingState(ApiLoadingState.Loading));
            const api = await getCompilerApi(compilerPackageName);
            dispatch(actions.refreshSourceFile(api));
            if (changeLoadingState)
                dispatch(actions.setApiLoadingState(ApiLoadingState.Loaded));
        }
        catch (err) {
            console.error(err);
            if (changeLoadingState)
                dispatch(actions.setApiLoadingState(ApiLoadingState.Error));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
