import { AppContextProvider } from "AppContext";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import "./external/react-splitpane.css";
import "./external/react-treeview.css";

ReactDOM.render(
  <AppContextProvider>
    <App />
  </AppContextProvider>,
  document.getElementById("root") as HTMLElement,
);
