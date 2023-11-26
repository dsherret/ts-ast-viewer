import { constants, Theme } from "@ts-ast-viewer/shared";
import type * as monacoEditorForTypes from "monaco-editor";
import React, { useEffect, useState } from "react";
import { FactoryCodeGenerator, getFactoryCodeGenerator } from "../compiler";
import { CompilerState } from "../types";
import { Box } from "../utils";
import { CodeEditor } from "./CodeEditor";
import { Spinner } from "./Spinner";

// todo: Move out getting the code generation function from this class (need to start loading it sooner than what's done here)

export interface FactoryCodeEditorProps {
  compiler: CompilerState;
  theme: "light" | "dark";
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

  if (factoryCodeGenerator == null) {
    return <Spinner />;
  }
  if (factoryCodeGenerator === false) {
    return <div className={"errorMessage"}>Error loading factory code. Please refresh the page to try again.</div>;
  }

  return (
    <CodeEditor
      id={constants.css.factoryCodeEditor.id}
      editorDidMount={editorDidMount}
      text={getText()}
      readOnly={true}
      theme={props.theme}
    />
  );

  function getText() {
    if (factoryCodeGenerator == null || factoryCodeGenerator === false) {
      return "";
    }

    return factoryCodeGenerator.value(props.compiler.api, props.compiler.selectedNode);
  }
}

function editorDidMount(editor: monacoEditorForTypes.editor.IStandaloneCodeEditor) {
  // global method for cypress
  (window as any).getFactoryCodeEditorText = () => editor.getValue();
}
