import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { AppContextProvider } from "./AppContext.js";
import "./external/react-treeview.css";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(
  <AppContextProvider>
    <App />
  </AppContextProvider>,
);
