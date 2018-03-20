import React from "react";
import ReactDOM from "react-dom";
import {createStore} from "redux";
import {Provider} from "react-redux";
import * as ts from "typescript";
import AppContainer from "./AppContainer";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";
import "./external/react-treeview.css";
import "./external/react-splitpane.css";
import {StoreState, TreeMode} from "./types";
import {appReducer} from "./reducers";
import {createSourceFile} from "./helpers";

const initialScriptTarget = ts.ScriptTarget.Latest;
const initialScriptKind = ts.ScriptKind.TSX;
const initialSourceFile = createSourceFile("", initialScriptTarget, initialScriptKind);
const store = createStore<StoreState>(appReducer, {
    sourceFile: initialSourceFile,
    selectedNode: initialSourceFile,
    options: {
        treeMode: TreeMode.getChildren,
        scriptTarget: initialScriptTarget,
        scriptKind: initialScriptKind
    }
});

ReactDOM.render(
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();
