import React from "react";
import ReactMonacoEditorForTypes from "react-monaco-editor";
import * as monacoEditorForTypes from "monaco-editor";
import { Spinner } from "./Spinner";
import { css as cssConstants } from "../constants";
import { CompilerState } from "../types";
import { FactoryCodeGenerator, CompilerPackageNames, getFactoryCodeGenerator } from "../compiler";

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
    private editor: monacoEditorForTypes.editor.IStandaloneCodeEditor | undefined;

    constructor(props: FactoryCodeEditorProps) {
        super(props);
        this.state = {
            editorComponent: undefined,
            factoryCodeGenerator: undefined,
            lastCompilerPackageName: undefined
        };
        this.editorDidMount = this.editorDidMount.bind(this);

        import("react-monaco-editor").then(editor => {
            this.setState({ editorComponent: editor.default });
        }).catch(err => {
            console.error(err);
            this.setState({ editorComponent: false });
        });
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
                lastCompilerPackageName: this.props.compiler.packageName
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
        if (this.state.editorComponent == null || this.state.factoryCodeGenerator == null)
            return <Spinner backgroundColor="#1e1e1e" />;
        if (this.state.editorComponent === false || this.state.factoryCodeGenerator === false)
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
        if (this.state.factoryCodeGenerator == null || this.state.factoryCodeGenerator === false)
            return undefined;

        return this.state.factoryCodeGenerator(this.props.compiler.api, this.props.compiler.selectedNode);
    }
}
