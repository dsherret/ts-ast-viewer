import type * as monacoEditorForTypes from "monaco-editor";
import React from "react";
import type * as ReactMonacoEditorForTypes from "react-monaco-editor";
import type { EditorDidMount } from "react-monaco-editor";
import { LineAndColumnComputer } from "../utils/index.js";
import { Spinner } from "./Spinner.js";

// Conversion of OS to light or dark is handled at the AppContext level.
export type CodeEditorTheme = "light" | "dark";

export interface CodeEditorProps {
  id?: string;
  onChange?: (text: string) => void;
  onClick?: (range: [number, number]) => void;
  theme: CodeEditorTheme;
  text: string;
  highlight?: { start: number; end: number } | undefined;
  showInfo?: boolean;
  readOnly?: boolean;
  renderWhiteSpace?: boolean;
  editorDidMount?: EditorDidMount;
}

export interface CodeEditorState {
  position: number;
  lineNumber: number;
  column: number;
  editorComponent: (typeof ReactMonacoEditorForTypes.default.default) | undefined | false;
}

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
  private editor: Parameters<EditorDidMount>[0] | undefined;
  private outerContainerRef = React.createRef<HTMLDivElement>();
  private disposables: monacoEditorForTypes.IDisposable[] = [];

  constructor(props: CodeEditorProps) {
    super(props);
    this.state = {
      position: 0,
      lineNumber: 1,
      column: 1,
      editorComponent: undefined,
    };
    this.editorDidMount = this.editorDidMount.bind(this);

    const reactMonacoEditorPromise = import("react-monaco-editor");
    import("monaco-editor").then((monacoEditor) => {
      monacoEditor.typescript.typescriptDefaults.setCompilerOptions({
        target: monacoEditor.typescript.ScriptTarget.ESNext,
        allowNonTsExtensions: true,
      });

      reactMonacoEditorPromise.then((editor) => {
        // types are wrong for this package
        this.setState({ editorComponent: (editor.default as any) });
      }).catch((err) => {
        console.error(err);
        this.setState({ editorComponent: false });
      });
    }).catch((err) => {
      console.error(err);
      this.setState({ editorComponent: false });
    });
  }

  override render() {
    this.updateHighlight();

    return (
      <div id={this.props.id} ref={this.outerContainerRef} className={getClassNames(this.props.showInfo)}>
        <div className="editorContainer">
          {this.getEditor()}
        </div>
        {this.props.showInfo && this.getInfo()}
      </div>
    );

    function getClassNames(showInfo: boolean | undefined) {
      const classNames = ["codeEditor"];
      if (showInfo) {
        classNames.push("hasInfo");
      }
      return classNames.join(" ");
    }
  }

  override componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables.length = 0; // clear
  }

  private getInfo() {
    return (
      <div className="editorInfo">
        Pos {this.state.position}, Ln {this.state.lineNumber}, Col {this.state.column}
      </div>
    );
  }

  private deltaDecorations: string[] = [];
  private lineAndColumnComputer = new LineAndColumnComputer("");
  private updateHighlight() {
    if (this.editor == null) {
      return;
    }

    if (this.lineAndColumnComputer.text !== this.props.text) {
      this.lineAndColumnComputer = new LineAndColumnComputer(this.props.text);
    }

    const { highlight } = this.props;
    const lineAndColumnComputer = this.lineAndColumnComputer;
    const range = getRange();

    this.deltaDecorations = this.editor.deltaDecorations(
      this.deltaDecorations,
      range == null ? [] : [{
        range,
        options: { className: "editorRangeHighlight" },
      }],
    );

    if (range) {
      try {
        this.editor.revealRangeInCenterIfOutsideViewport(range);
      } catch {
        // ignore, for some reason this was throwing
      }
    }

    function getRange(): monacoEditorForTypes.IRange | undefined {
      if (highlight == null) {
        return undefined;
      }

      const startInfo = lineAndColumnComputer.getNumberAndColumnFromPos(highlight.start);
      const endInfo = lineAndColumnComputer.getNumberAndColumnFromPos(highlight.end);

      return {
        startLineNumber: startInfo.lineNumber,
        startColumn: startInfo.column,
        endLineNumber: endInfo.lineNumber,
        endColumn: endInfo.column,
      };
    }
  }

  private getEditor() {
    if (this.state.editorComponent == null) {
      return <Spinner />;
    }
    if (this.state.editorComponent === false) {
      return <div className="errorMessage">Error loading code editor. Please refresh the page to try again.</div>;
    }

    return (
      <this.state.editorComponent
        width="100%"
        height="100%"
        value={this.props.text}
        theme={this.props.theme == "dark" ? "vs-dark" : "vs"}
        language="typescript"
        onChange={(text) => this.props.onChange && this.props.onChange(text)}
        editorDidMount={this.editorDidMount}
        options={{
          automaticLayout: false,
          renderWhitespace: this.props.renderWhiteSpace ? "all" : "none",
          minimap: { enabled: false },
          readOnly: this.props.readOnly,
          quickSuggestions: false,
          occurrencesHighlight: "off",
          selectionHighlight: false,
          codeLens: false,
          suggestOnTriggerCharacters: false,
        }}
      />
    );
  }

  private editorDidMount(editor: Parameters<EditorDidMount>[0], monaco: Parameters<EditorDidMount>[1]) {
    this.editor = editor;

    // use lf newlines
    editor.getModel()?.setEOL(monaco.editor.EndOfLineSequence.LF);

    this.disposables.push(editor.onDidChangeCursorPosition((e) => {
      const editorModel = editor.getModel();
      if (editorModel == null) {
        return;
      }

      this.setState({
        position: editorModel.getOffsetAt(e.position),
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      });
    }));
    this.disposables.push(editor.onMouseDown((e) => {
      if (e.target == null || e.target.range == null || this.props.onClick == null) {
        return;
      }

      // Sometimes e.target.range will be the column right before if clicked to the left enough,
      // but the cursor position will still be at the next column. For that reason, always
      // use the editor position.
      const pos = editor.getPosition();
      if (pos != null) {
        const start = this.lineAndColumnComputer.getPosFromLineAndColumn(pos.lineNumber, pos.column);
        this.props.onClick([start, start]);
      }
    }));

    // manually refresh the layout of the editor (lightweight compared to monaco editor)
    let lastHeight = 0;
    let lastWidth = 0;
    const intervalId = setInterval(() => {
      const containerElement = this.outerContainerRef.current;
      if (containerElement == null) {
        return;
      }

      const width = containerElement.offsetWidth;
      const height = containerElement.offsetHeight;
      if (lastHeight === height && lastWidth === width) {
        return;
      }

      editor.layout();

      lastHeight = height;
      lastWidth = width;
    }, 500);
    this.disposables.push({ dispose: () => clearInterval(intervalId) });

    this.updateHighlight();

    if (this.props.editorDidMount) {
      this.props.editorDidMount(editor, monaco);
    }
  }
}
