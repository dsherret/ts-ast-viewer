import {connect, Dispatch} from 'react-redux';
import ts from "typescript";
import App from "./App";
import * as actions from "./actions";
import {StoreState, OptionsState} from "./types";

export function mapStateToProps(state: StoreState) {
    return {
        ...state
    };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AllActions>) {
    return {
        onSourceFileChange: (sourceFile: ts.SourceFile) => dispatch(actions.setSourceFile(sourceFile)),
        onPosChange: (pos: number) => dispatch(actions.setPos(pos)),
        onNodeChange: (node: ts.Node) => dispatch(actions.setSelectedNode(node)),
        onOptionsChange: (options: OptionsState) => dispatch(actions.setOptions(options))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
