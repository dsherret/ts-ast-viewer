import type * as monacoEditorForTypes from "monaco-editor";
import React from "react";
import { LineAndColumnComputer } from "../utils/index.js";
import { Spinner } from "./Spinner.js";

export type Monaco = typeof monacoEditorForTypes;
export type MonacoCodeEditor = monacoEditorForTypes.editor.IStandaloneCodeEditor;
export type EditorDidMount = (editor: MonacoCodeEditor, monaco: Monaco) => void;

// Conversion of OS to light or dark is handled at the AppContext level.
export type CodeEditorTheme = "light" | "dark";

export interface CodeEditorProps {
  id?: string;
  /** Text shown in the editor. */
  text: string;
  /**
   * Path of `text` within the in-memory project (ex. `/main.ts`). Providing this backs the
   * editor with one `file://` model per file, which is what makes auto complete, hover, and
   * go to definition resolve across the project's files.
   */
  filePath?: string;
  /**
   * Every file in the project. Files other than `filePath` are kept as background models so
   * imports resolve to them. The entry for `filePath` is ignored in favour of `text`.
   */
  files?: Record<string, string>;
  onChange?: (text: string) => void;
  onClick?: (range: [number, number]) => void;
  theme: CodeEditorTheme;
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
  loadState: "loading" | "loaded" | "error";
}

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
  private readonly outerContainerRef = React.createRef<HTMLDivElement>();
  private readonly monacoContainerRef = React.createRef<HTMLDivElement>();
  /** Model path used when the editor isn't showing a project file (ex. the factory code pane). */
  private readonly standalonePath = `inmemory://standalone/${nextStandaloneId++}.ts`;
  private readonly models = new Map<string, monacoEditorForTypes.editor.ITextModel>();
  private readonly viewStates = new Map<string, monacoEditorForTypes.editor.ICodeEditorViewState>();
  private readonly disposables: monacoEditorForTypes.IDisposable[] = [];
  private monaco: Monaco | undefined;
  private editor: MonacoCodeEditor | undefined;
  private currentPath: string | undefined;
  private lastSyncedPaths = "";
  private applyingExternalEdit = false;
  private unmounted = false;

  constructor(props: CodeEditorProps) {
    super(props);
    this.state = {
      position: 0,
      lineNumber: 1,
      column: 1,
      loadState: "loading",
    };
  }

  override render() {
    return (
      <div id={this.props.id} ref={this.outerContainerRef} className={getClassNames(this.props.showInfo)}>
        <div className="editorContainer">
          <div className="monacoContainer" ref={this.monacoContainerRef} />
          {this.state.loadState !== "loaded" && (
            <div className="editorOverlay">
              {this.state.loadState === "error"
                ? <div className="errorMessage">Error loading code editor. Please refresh the page to try again.</div>
                : <Spinner />}
            </div>
          )}
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

  override componentDidMount() {
    loadMonaco().then((monaco) => {
      if (this.unmounted) {
        return;
      }
      this.monaco = monaco;
      this.createEditor(monaco);
      this.setState({ loadState: "loaded" });
    }).catch((err) => {
      console.error(err);
      if (!this.unmounted) {
        this.setState({ loadState: "error" });
      }
    });
  }

  override componentDidUpdate(prevProps: CodeEditorProps) {
    const { editor, monaco } = this;
    if (editor == null || monaco == null) {
      return;
    }

    if (prevProps.theme !== this.props.theme) {
      monaco.editor.setTheme(getMonacoTheme(this.props.theme));
    }
    if (prevProps.readOnly !== this.props.readOnly || prevProps.renderWhiteSpace !== this.props.renderWhiteSpace) {
      editor.updateOptions(getEditorOptions(this.props));
    }

    this.syncModels();
    this.updateHighlight();
  }

  override componentWillUnmount() {
    this.unmounted = true;
    this.editor?.dispose();
    this.editor = undefined;
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables.length = 0; // clear
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.clear();
    this.viewStates.clear();
  }

  private createEditor(monaco: Monaco) {
    const container = this.monacoContainerRef.current;
    if (container == null) {
      return;
    }

    const path = this.getCurrentPath();
    this.currentPath = path;
    const editor = monaco.editor.create(container, {
      ...getEditorOptions(this.props),
      model: this.getOrCreateModel(path, this.props.text),
      theme: getMonacoTheme(this.props.theme),
    });
    this.editor = editor;

    // use lf newlines
    editor.getModel()?.setEOL(monaco.editor.EndOfLineSequence.LF);

    this.disposables.push(editor.onDidChangeModelContent(() => {
      if (this.applyingExternalEdit) {
        return;
      }
      this.props.onChange?.(editor.getValue());
    }));

    this.disposables.push(
      editor.onDidChangeCursorPosition((e: monacoEditorForTypes.editor.ICursorPositionChangedEvent) => {
        const editorModel = editor.getModel();
        if (editorModel == null) {
          return;
        }

        this.setState({
          position: editorModel.getOffsetAt(e.position),
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        });
      }),
    );
    this.disposables.push(editor.onMouseDown((e: monacoEditorForTypes.editor.IEditorMouseEvent) => {
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

    this.syncModels();
    this.updateHighlight();

    this.props.editorDidMount?.(editor, monaco);
  }

  /**
   * Brings monaco's models in line with the props: every project file gets a model so the
   * language service can resolve imports to it, and the visible model is swapped when the
   * selected file changes.
   */
  private syncModels() {
    const { editor, monaco } = this;
    if (editor == null || monaco == null) {
      return;
    }

    const path = this.getCurrentPath();
    const files = { ...this.props.files, [path]: this.props.text };

    for (const [filePath, text] of Object.entries(files)) {
      const model = this.getOrCreateModel(filePath, text);
      if (model.getValue() !== text) {
        // an edit operation rather than setValue so the undo stack and cursor survive
        this.applyingExternalEdit = true;
        try {
          model.pushEditOperations([], [{ range: model.getFullModelRange(), text }], () => null);
        } finally {
          this.applyingExternalEdit = false;
        }
      }
    }

    for (const [filePath, model] of [...this.models]) {
      if (!(filePath in files)) {
        model.dispose();
        this.models.delete(filePath);
        this.viewStates.delete(filePath);
      }
    }

    if (path !== this.currentPath) {
      if (this.currentPath != null) {
        const viewState = editor.saveViewState();
        if (viewState != null) {
          this.viewStates.set(this.currentPath, viewState);
        }
      }
      editor.setModel(this.models.get(path)!);
      const viewState = this.viewStates.get(path);
      if (viewState != null) {
        editor.restoreViewState(viewState);
      }
      this.currentPath = path;
    }

    this.syncModelsWithLanguageService();
  }

  /**
   * Pushes the background models to the TypeScript worker. Monaco only syncs a model once a
   * language feature runs against it, so files that are never opened would otherwise be
   * invisible to the language service and imports of them wouldn't resolve.
   */
  private syncModelsWithLanguageService() {
    const monaco = this.monaco;
    if (monaco == null || this.props.files == null) {
      return;
    }

    const paths = [...this.models.keys()].sort().join("\n");
    if (paths === this.lastSyncedPaths) {
      return;
    }
    this.lastSyncedPaths = paths;

    const uris = Array.from(this.models.values(), (model) => model.uri);
    monaco.typescript.getTypeScriptWorker()
      .then((getWorker) => getWorker(...uris))
      .catch((err) => console.error(err));
  }

  private getOrCreateModel(path: string, text: string) {
    const existing = this.models.get(path);
    if (existing != null) {
      return existing;
    }

    const monaco = this.monaco!;
    const uri = path.includes("://") ? monaco.Uri.parse(path) : monaco.Uri.file(path);
    // every file uses the typescript language (even .js ones) so they all share a single
    // program — monaco runs the "javascript" language in a separate worker
    const model = monaco.editor.getModel(uri) ?? monaco.editor.createModel(text, "typescript", uri);
    model.setEOL(monaco.editor.EndOfLineSequence.LF);
    this.models.set(path, model);
    return model;
  }

  private getCurrentPath() {
    return this.props.filePath ?? this.standalonePath;
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
}

let nextStandaloneId = 1;
let monacoPromise: Promise<Monaco> | undefined;

function loadMonaco() {
  return monacoPromise ??= (async () => {
    const { setUpMonacoEnvironment } = await import("./monacoEnvironment.js");
    setUpMonacoEnvironment(); // must happen before monaco creates any worker
    const monaco = await import("monaco-editor");
    configureTypeScriptDefaults(monaco);
    return monaco;
  })();
}

function configureTypeScriptDefaults(monaco: Monaco) {
  const { typescriptDefaults, ScriptTarget, ModuleKind, JsxEmit } = monaco.typescript;
  typescriptDefaults.setCompilerOptions({
    target: ScriptTarget.ESNext,
    module: ModuleKind.ESNext,
    // `ModuleResolutionKind.Bundler` — newer than the enum monaco's types ship, but its
    // worker runs TypeScript 5.9. Resolves `./other`, `./other.js`, and `./other.ts` alike.
    moduleResolution: 100 as never,
    allowImportingTsExtensions: true,
    noEmit: true, // required by allowImportingTsExtensions
    allowJs: true,
    jsx: JsxEmit.Preserve,
    esModuleInterop: true,
    allowNonTsExtensions: true,
  });
  // sync every typescript model to the worker, not just the one being queried, so
  // background files participate in the program
  typescriptDefaults.setEagerModelSync(true);
  // background models are never displayed, so don't spend time computing their markers
  typescriptDefaults.setDiagnosticsOptions({ onlyVisible: true });
}

function getEditorOptions(props: CodeEditorProps): monacoEditorForTypes.editor.IStandaloneEditorConstructionOptions {
  return {
    automaticLayout: false,
    renderWhitespace: props.renderWhiteSpace ? "all" : "none",
    minimap: { enabled: false },
    // a hair of space so the first line doesn't touch the tab bar above the editor
    padding: { top: 2 },
    readOnly: props.readOnly,
    occurrencesHighlight: "off",
    selectionHighlight: false,
    codeLens: false,
    // render the suggest/hover widgets in an overlay so the split pane can't clip them
    fixedOverflowWidgets: true,
  };
}

function getMonacoTheme(theme: CodeEditorTheme) {
  return theme === "dark" ? "vs-dark" : "vs";
}
