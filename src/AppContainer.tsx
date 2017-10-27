import {connect, Dispatch} from 'react-redux';
import * as ts from "typescript";
import App from './App';
import * as actions from './actions/';
import {StoreState} from './types/index';

export function mapStateToProps(state: StoreState) {
    return {
        ...state
    };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AllActions>) {
    return {
        onSourceFileChange: (sourceFile: ts.SourceFile) => dispatch(actions.setSourceFile(sourceFile)),
        onPosChange: (pos: number) => dispatch(actions.setPos(pos))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
