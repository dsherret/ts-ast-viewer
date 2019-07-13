import React from "react";
import ReactMonacoEditorForTypes from "react-monaco-editor";
import * as monacoEditorForTypes from "monaco-editor";
import tsCreatorForTypes from "ts-creator";
import { Spinner } from "./Spinner";
import { css as cssConstants } from "../constants";

export interface FactoryCodeEditorProps {
    text: string;
    isTsx: boolean;
}

export interface FactoryCodeEditorState {
    editorComponent: (typeof ReactMonacoEditorForTypes) | undefined | false;
    tsCreator: (typeof tsCreatorForTypes) | undefined | false;
}

export class FactoryCodeEditor extends React.Component<FactoryCodeEditorProps, FactoryCodeEditorState> {
    private editor: monacoEditorForTypes.editor.IStandaloneCodeEditor | undefined;

    constructor(props: FactoryCodeEditorProps) {
        super(props);
        this.state = {
            editorComponent: undefined,
            tsCreator: undefined
        };
        this.editorDidMount = this.editorDidMount.bind(this);

        import("react-monaco-editor").then(editor => {
            this.setState({ editorComponent: editor.default });
        }).catch(err => {
            console.error(err);
            this.setState({ editorComponent: false });
        });
        import("ts-creator").then(tsCreator => {
            this.setState({ tsCreator: tsCreator.default });
        }).catch(err => {
            console.error(err);
            this.setState({ tsCreator: false });
        });
    }

    render() {
        return (
            <div id={cssConstants.factoryCodeEditor.id}>
                {this.getEditor()}
            </div>
        );
    }

    private getEditor() {
        if (this.state.editorComponent == null || this.state.tsCreator == null)
            return <Spinner backgroundColor="#1e1e1e" />;
        if (this.state.editorComponent === false || this.state.tsCreator === false)
            return <div className={"errorMessage"}>Error loading factory code. Please refresh the page to try again.</div>;

        return (
            <this.state.editorComponent
                width="100%"
                height="100%"
                value={this.getText()}
                theme="vs-dark"
                language="typescript"
                editorDidMount={this.editorDidMount}
                options={{ automaticLayout: true, renderWhitespace: "none", readOnly: true, minimap: { enabled: false } }}
            />
        );
    }

    private editorDidMount(editor: monacoEditorForTypes.editor.IStandaloneCodeEditor) {
        this.editor = editor;

        // global method for cypress
        (window as any).getFactoryCodeEditorText = () => editor.getValue();
    }

    private getText() {
        if (this.state.tsCreator == null || this.state.tsCreator === false)
            return undefined;

        return this.state.tsCreator(this.props.text, {
            prettierOptions: { semi: true },
            tsx: this.props.isTsx
        });
    }
}