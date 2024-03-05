import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App.js";
import { AppContextProvider } from "./AppContext.js";
import "./external/react-treeview.css";

ReactDOM.render(
  <AppContextProvider>
    <App />
  </AppContextProvider>,
  document.getElementById("root") as HTMLElement,
);
