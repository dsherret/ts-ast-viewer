import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { AppContextProvider } from "./AppContext";
import "./external/react-treeview.css";

ReactDOM.render(
  <AppContextProvider>
    <App />
  </AppContextProvider>,
  document.getElementById("root") as HTMLElement,
);
