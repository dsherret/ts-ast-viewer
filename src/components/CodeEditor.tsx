import React from "react";
import ReactMonacoEditorForTypes from "react-monaco-editor";
import * as monacoEditorForTypes from "monaco-editor";
import { Spinner } from "./Spinner";
import { css as cssConstants } from "../constants";
import { LineAndColumnComputer } from "../utils";

export interface CodeEditorProps {
    onChange: (text: string) => void;
    onClick: (pos: number) => void;
    text: string;
    highlight: { start: number; end: number } | undefined;
}

export interface CodeEditorState {
    position: number;
    lineNumber: number;
    column: number;
    editorComponent: (typeof ReactMonacoEditorForTypes) | undefined | false;
}

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
    private editor: monacoEditorForTypes.editor.IStandaloneCodeEditor | undefined;

    constructor(props: CodeEditorProps) {
        super(props);
        this.state = {
            position: 0,
            lineNumber: 1,
            column: 1,
            editorComponent: undefined
        };
        this.editorDidMount = this.editorDidMount.bind(this);

        import("react-monaco-editor").then(editor => {
            this.setState({ editorComponent: editor.default });
        }).catch(err => {
            this.setState({ editorComponent: false });
        });
    }

    render() {
        this.updateHighlight();

        return (
            <div id={cssConstants.codeEditor.id}>
                <div id={cssConstants.codeEditor.containerId}>
                    {this.getEditor()}
                </div>
                <div id={cssConstants.codeEditor.infoId}>Pos {this.state.position}, Ln {this.state.lineNumber}, Col {this.state.column}</div>
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
                onChange={text => this.props.onChange(text)}
                editorDidMount={this.editorDidMount}
                options={{ automaticLayout: true, renderWhitespace: "all" }}
            />);
    }

    private editorDidMount(editor: monacoEditorForTypes.editor.IStandaloneCodeEditor) {
        this.editor = editor;

        editor.onDidChangeCursorPosition(e => {
            this.setState({
                position: editor.getModel().getOffsetAt(e.position),
                lineNumber: e.position.lineNumber,
                column: e.position.column
            });
        });
        editor.focus();
        this.updateHighlight();

        // global method for cypress
        (window as any).setMonacoEditorText = (text: string) => {
            editor.executeEdits("my-source", [{
                range: editor.getModel().getFullModelRange(),
                text
            }]);
        };
    }
}
