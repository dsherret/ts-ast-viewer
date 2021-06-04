import * as monacoEditorForTypes from "monaco-editor";
import React, { useEffect, useState } from "react";
import ReactMonacoEditorForTypes from "react-monaco-editor";
import { CompilerPackageNames, FactoryCodeGenerator, getFactoryCodeGenerator } from "../compiler";
import { CompilerState } from "../types";
import { Box } from "../utils";
import { CodeEditor } from "./CodeEditor";
import { Spinner } from "./Spinner";

// todo: Move out getting the code generation function from this class (need to start loading it sooner than what's done here)

export interface FactoryCodeEditorProps {
    compiler: CompilerState;
}

export interface FactoryCodeEditorState {
    editorComponent: (typeof ReactMonacoEditorForTypes) | undefined | false;
    factoryCodeGenerator: FactoryCodeGenerator | false | undefined;
    lastCompilerPackageName: CompilerPackageNames | undefined;
}

export function FactoryCodeEditor(props: FactoryCodeEditorProps) {
    const [factoryCodeGenerator, setFactoryCodeGenerator] = useState<Box<FactoryCodeGenerator> | false | undefined>();

    useEffect(() => {
        setFactoryCodeGenerator(undefined);

        getFactoryCodeGenerator(props.compiler.packageName).then(factoryCodeGenerator => {
            setFactoryCodeGenerator(new Box(factoryCodeGenerator));
        }).catch(err => {
            console.error(err);
            setFactoryCodeGenerator(false);
        });
    }, [props.compiler.packageName]);

    if (factoryCodeGenerator == null)
        return <Spinner backgroundColor="#1e1e1e" />;
    if (factoryCodeGenerator === false)
        return <div className={"errorMessage"}>Error loading factory code. Please refresh the page to try again.</div>;

    return (
        <CodeEditor
            editorDidMount={editorDidMount}
            text={getText()}
            readOnly={true}
        />
    );

    function getText() {
        if (factoryCodeGenerator == null || factoryCodeGenerator === false)
            return "";

        return factoryCodeGenerator.value(props.compiler.api, props.compiler.selectedNode);
    }
}

function editorDidMount(editor: monacoEditorForTypes.editor.IStandaloneCodeEditor) {
    // global method for cypress
    (window as any).getFactoryCodeEditorText = () => editor.getValue();
}
