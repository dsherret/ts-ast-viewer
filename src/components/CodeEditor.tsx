import React from "react";
import ReactMonacoEditorForTypes, { EditorDidMount } from "react-monaco-editor";
import * as monacoEditorForTypes from "monaco-editor";
import { Spinner } from "./Spinner";
import { LineAndColumnComputer } from "../utils";

export interface CodeEditorProps {
    id?: string;
    onChange?: (text: string) => void;
    onClick?: (range: [number, number]) => void;
    text: string;
    highlight?: { start: number; end: number; } | undefined;
    showInfo?: boolean;
    readOnly?: boolean;
    renderWhiteSpace?: boolean;
    editorDidMount?: EditorDidMount;
}

export interface CodeEditorState {
    position: number;
    lineNumber: number;
    column: number;
    editorComponent: (typeof ReactMonacoEditorForTypes) | undefined | false;
}

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
    private editor: monacoEditorForTypes.editor.IStandaloneCodeEditor | undefined;
    private outerContainerRef = React.createRef<HTMLDivElement>();

    constructor(props: CodeEditorProps) {
        super(props);
        this.state = {
            position: 0,
            lineNumber: 1,
            column: 1,
            editorComponent: undefined
        };
        this.editorDidMount = this.editorDidMount.bind(this);

        const reactMonacoEditorPromise = import("react-monaco-editor");
        import("monaco-editor").then(monacoEditor => {
            monacoEditor.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monacoEditor.languages.typescript.ScriptTarget.ESNext,
                allowNonTsExtensions: true
            });

            reactMonacoEditorPromise.then(editor => {
                this.setState({ editorComponent: editor.default });
            }).catch(err => {
                console.log(err);
                this.setState({ editorComponent: false });
            });
        }).catch(err => {
            console.log(err);
            this.setState({ editorComponent: false });
        });
    }

    render() {
        this.updateHighlight();

        return (
            <div id={this.props.id} ref={this.outerContainerRef} className={getClassNames(this.props.showInfo)}>
                <div className={"editorContainer"}>
                    {this.getEditor()}
                </div>
                {this.props.showInfo && this.getInfo()}
            </div>
        );

        function getClassNames(showInfo: boolean | undefined) {
            const classNames = ["codeEditor"];
            if (showInfo)
                classNames.push("hasInfo");
            return classNames.join(" ");
        }
    }

    private getInfo() {
        return (
            <div className={"editorInfo"}>
                Pos {this.state.position}, Ln {this.state.lineNumber}, Col {this.state.column}
            </div>
        );
    }

    private deltaDecorations: string[] = [];
    private lineAndColumnComputer = new LineAndColumnComputer("");
    private updateHighlight() {
        if (this.editor == null)
            return;

        if (this.lineAndColumnComputer.text !== this.props.text)
            this.lineAndColumnComputer = new LineAndColumnComputer(this.props.text);

        const { highlight } = this.props;
        const lineAndColumnComputer = this.lineAndColumnComputer;
        const range = getRange();

        this.deltaDecorations = this.editor.deltaDecorations(this.deltaDecorations, range == null ? [] : [{
            range,
            options: { className: "editorRangeHighlight" }
        }]);

        function getRange(): monacoEditorForTypes.IRange | undefined {
            if (highlight == null)
                return undefined;

            const startInfo = lineAndColumnComputer.getNumberAndColumnFromPos(highlight.start);
            const endInfo = lineAndColumnComputer.getNumberAndColumnFromPos(highlight.end);

            return {
                startLineNumber: startInfo.lineNumber,
                startColumn: startInfo.column,
                endLineNumber: endInfo.lineNumber,
                endColumn: endInfo.column
            };
        }
    }

    private getEditor() {
        if (this.state.editorComponent == null)
            return <Spinner backgroundColor="#1e1e1e" />;
        if (this.state.editorComponent === false)
            return <div className={"errorMessage"}>Error loading code editor. Please refresh the page to try again.</div>;

        return (
            <this.state.editorComponent
                width="100%"
                height="100%"
                value={this.props.text}
                theme="vs-dark"
                language="typescript"
                onChange={text => this.props.onChange && this.props.onChange(text)}
                editorDidMount={this.editorDidMount}
                options={{
                    automaticLayout: false,
                    renderWhitespace: this.props.renderWhiteSpace ? "all" : "none",
                    minimap: { enabled: false },
                    readOnly: this.props.readOnly,
                    quickSuggestions: false,
                    wordBasedSuggestions: false,
                    occurrencesHighlight: false,
                    selectionHighlight: false,
                    codeLens: false,
                    suggestOnTriggerCharacters: false
                }}
            />
        );
    }

    private editorDidMount(editor: monacoEditorForTypes.editor.IStandaloneCodeEditor, monaco: typeof monacoEditorForTypes) {
        this.editor = editor;

        editor.onDidChangeCursorPosition(e => {
            const editorModel = editor.getModel();
            if (editorModel == null)
                return;

            this.setState({
                position: editorModel.getOffsetAt(e.position),
                lineNumber: e.position.lineNumber,
                column: e.position.column
            });
        });
        editor.onMouseDown(e => {
            if (e.target == null || e.target.range == null || this.props.onClick == null)
                return;

            // Sometimes e.target.range will be the column right before if clicked to the left enough,
            // but the cursor position will still be at the next column. For that reason, always
            // use the editor posiion.
            const pos = editor.getPosition();
            if (pos != null) {
                const start = this.lineAndColumnComputer.getPosFromLineAndColumn(pos.lineNumber, pos.column);
                this.props.onClick([start, start]);
            }
        });

        // manually refresh the layout of the editor (lightweight compared to monaco editor)
        let lastHeight = 0;
        let lastWidth = 0;
        setInterval(() => {
            const containerElement = this.outerContainerRef.current;
            if (containerElement == null)
                return;

            const width = containerElement.offsetWidth;
            const height = containerElement.offsetHeight;
            if (lastHeight === height && lastWidth === width)
                return;

            editor.layout();

            lastHeight = height;
            lastWidth = width;
        }, 500);

        this.updateHighlight();

        if (this.props.editorDidMount)
            this.props.editorDidMount(editor, monaco);
    }
}
