import React from "react";
import ReactMonacoEditorForTypes from "react-monaco-editor";
import * as monacoEditorForTypes from "monaco-editor";
import { Spinner } from "./Spinner";
import { css as cssConstants } from "../constants";
import { CompilerState } from "../types";
import { FactoryCodeGenerator, CompilerPackageNames, getFactoryCodeGenerator } from "../compiler";
import { CodeEditor } from "./CodeEditor";

// todo: Move out getting the code generation function from this class (need to start loading it sooner than what's done here)

export interface FactoryCodeEditorProps {
    compiler: CompilerState;
}

export interface FactoryCodeEditorState {
    editorComponent: (typeof ReactMonacoEditorForTypes) | undefined | false;
    factoryCodeGenerator: FactoryCodeGenerator | false | undefined;
    lastCompilerPackageName: CompilerPackageNames | undefined;
}

export class FactoryCodeEditor extends React.Component<FactoryCodeEditorProps, FactoryCodeEditorState> {
    constructor(props: FactoryCodeEditorProps) {
        super(props);
        this.state = {
            editorComponent: undefined,
            factoryCodeGenerator: undefined,
            lastCompilerPackageName: undefined,
        };
        this.editorDidMount = this.editorDidMount.bind(this);
    }

    render() {
        this.updateFactoryCodeGenerator();

        return (
            <div id={cssConstants.factoryCodeEditor.id}>
                {this.getEditor()}
            </div>
        );
    }

    private updateFactoryCodeGenerator() {
        if (this.state.lastCompilerPackageName === this.props.compiler.packageName)
            return;

        // todo: how to not do this in a render method? I'm not a react or web person
        setTimeout(() => {
            this.setState({
                factoryCodeGenerator: undefined,
                lastCompilerPackageName: this.props.compiler.packageName,
            });

            getFactoryCodeGenerator(this.props.compiler.packageName).then(factoryCodeGenerator => {
                this.setState({ factoryCodeGenerator });
            }).catch(err => {
                console.error(err);
                this.setState({ factoryCodeGenerator: false });
            });
        }, 0);
    }

    private getEditor() {
        if (this.state.factoryCodeGenerator == null)
            return <Spinner backgroundColor="#1e1e1e" />;
        if (this.state.factoryCodeGenerator === false)
            return <div className={"errorMessage"}>Error loading factory code. Please refresh the page to try again.</div>;

        return (
            <CodeEditor
                editorDidMount={this.editorDidMount}
                text={this.getText()}
                readOnly={true}
            />
        );
    }

    private editorDidMount(editor: monacoEditorForTypes.editor.IStandaloneCodeEditor) {
        // global method for cypress
        (window as any).getFactoryCodeEditorText = () => editor.getValue();
    }

    private getText() {
        if (this.state.factoryCodeGenerator == null || this.state.factoryCodeGenerator === false)
            return "";

        return this.state.factoryCodeGenerator(this.props.compiler.api, this.props.compiler.selectedNode);
    }
}
