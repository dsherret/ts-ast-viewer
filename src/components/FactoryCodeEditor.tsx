import { useEffect, useState } from "react";
import { type FactoryCodeGenerator, getFactoryCodeGenerator } from "../compiler/index.js";
import type { CompilerState } from "../types/index.js";
import { Box } from "../utils/index.js";
import { CodeEditor } from "./CodeEditor.js";
import { Spinner } from "./Spinner.js";

// todo: Move out getting the code generation function from this class (need to start loading it sooner than what's done here)

export interface FactoryCodeEditorProps {
  compiler: CompilerState;
  theme: "light" | "dark";
}

export function FactoryCodeEditor(props: FactoryCodeEditorProps) {
  const [factoryCodeGenerator, setFactoryCodeGenerator] = useState<Box<FactoryCodeGenerator> | false | undefined>();

  useEffect(() => {
    setFactoryCodeGenerator(undefined);

    getFactoryCodeGenerator(props.compiler.packageName).then((factoryCodeGenerator) => {
      setFactoryCodeGenerator(new Box(factoryCodeGenerator));
    }).catch((err) => {
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
      id="factoryCodeEditor"
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
