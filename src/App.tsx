import { Allotment } from "allotment";
import "./App.css";
import "allotment/dist/style.css";
import { useAppContext } from "./AppContext.js";
import { getDescendantAtRange, getStartSafe } from "./compiler/index.js";
import * as components from "./components/index.js";
import { ApiLoadingState } from "./types/index.js";

export function App() {
  const { state, dispatch } = useAppContext();
  const compiler = state.compiler;

  return (
    <div id="App" data-theme={state.editorTheme}>
      <header id="AppHeader" className="clearfix">
        <h2 id="title">TypeScript AST Viewer</h2>
        <components.Options
          api={compiler == null ? undefined : compiler.api}
          options={state.options}
          onChange={(options) =>
            dispatch({
              type: "SET_OPTIONS",
              options,
            })}
        />
      </header>
      <div id="AppBody">
        <Allotment minSize={50}>
          <Allotment.Pane preferredSize={"33%"}>
            {getCodeEditorArea()}
          </Allotment.Pane>
          {getCompilerDependentPanes()}
        </Allotment>
      </div>
    </div>
  );

  function getCodeHighlightRange() {
    if (compiler == null) {
      return undefined;
    }

    const { selectedNode, sourceFile } = compiler;
    return selectedNode === sourceFile ? undefined : {
      start: getStartSafe(selectedNode, sourceFile),
      end: selectedNode.end,
    };
  }

  function getCodeEditorArea() {
    if (state.options.showFactoryCode) {
      return (
        <Allotment vertical={true}>
          <Allotment.Pane preferredSize={"70%"}>
            {getCodeEditor()}
          </Allotment.Pane>
          {getFactoryCodeEditor()}
        </Allotment>
      );
    } else {
      return getCodeEditor();
    }

    function getFactoryCodeEditor() {
      if (compiler == null || state.apiLoadingState === ApiLoadingState.Loading) {
        return <components.Spinner />;
      }

      return (
        <components.ErrorBoundary getResetHash={() => state.code}>
          <components.FactoryCodeEditor compiler={compiler} theme={state.editorTheme} />
        </components.ErrorBoundary>
      );
    }

    function getCodeEditor() {
      return (
        <components.CodeEditor
          id="codeEditor"
          onChange={(code) => dispatch({ type: "SET_CODE", code })}
          onClick={(range) => {
            if (compiler == null) {
              return;
            }
            const descendant = getDescendantAtRange(
              state.options.treeMode,
              compiler.sourceFile,
              range,
              compiler.api,
            );
            dispatch({ type: "SET_SELECTED_NODE", node: descendant });
          }}
          theme={state.editorTheme}
          text={state.code}
          highlight={getCodeHighlightRange()}
          showInfo={true}
          renderWhiteSpace={true}
          editorDidMount={codeEditorDidMount}
        />
      );
    }
  }

  function getCompilerDependentPanes() {
    if (compiler == null || state.apiLoadingState === ApiLoadingState.Loading) {
      return <components.Spinner />;
    } else if (state.apiLoadingState === ApiLoadingState.Error) {
      return <div className={"errorMessage"}>Error loading compiler API. Please refresh the page to try again.</div>;
    }

    return (
      <Allotment>
        <Allotment.Pane minSize={50} preferredSize="50%">
          <components.ErrorBoundary>
            <components.TreeViewer
              api={compiler.api}
              selectedNode={compiler.selectedNode}
              sourceFile={compiler.sourceFile}
              onSelectNode={(node) => dispatch({ type: "SET_SELECTED_NODE", node })}
              mode={state.options.treeMode}
            />
          </components.ErrorBoundary>
        </Allotment.Pane>
        <Allotment.Pane minSize={50} preferredSize="50%">
          <components.ErrorBoundary>
            <components.PropertiesViewer
              compiler={compiler}
              selectedNode={compiler.selectedNode}
              sourceFile={compiler.sourceFile}
              bindingTools={compiler.bindingTools}
              bindingEnabled={state.options.bindingEnabled}
              showInternals={state.options.showInternals}
            />
          </components.ErrorBoundary>
        </Allotment.Pane>
      </Allotment>
    );
  }

  function codeEditorDidMount(editor: Parameters<import("react-monaco-editor").EditorDidMount>[0]) {
    // For some reason a slight delay is necessary here. Otherwise it won't let the user type.
    setTimeout(() => editor.focus(), 100);
  }
}
