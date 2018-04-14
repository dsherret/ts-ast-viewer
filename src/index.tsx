import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { ScriptTarget, ScriptKind } from "./compiler";
import AppContainer from "./AppContainer";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";
import "./external/react-treeview.css";
import "./external/react-splitpane.css";
import * as actions from "./actions";
import { StoreState, TreeMode, ApiLoadingState } from "./types";
import { appReducer } from "./reducers";

const initialScriptTarget: ScriptTarget = 6 /* Latest */;
const initialScriptKind: ScriptKind = 4 /* TSX */;
const initialCode = "";
const store = createStore<StoreState>(appReducer, {
    apiLoadingState: ApiLoadingState.Loading,
    code: initialCode,
    options: {
        compilerPackageName: "typescript",
        treeMode: TreeMode.getChildren,
        scriptTarget: initialScriptTarget,
        scriptKind: initialScriptKind
    },
    compiler: undefined
});

ReactDOM.render(
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();
