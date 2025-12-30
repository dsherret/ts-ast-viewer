import type React from "react";
import { useRef, useState } from "react";
import {
  type CompilerApi,
  type CompilerPackageNames,
  compilerVersionCollection,
  type ScriptKind,
  type ScriptTarget,
} from "../compiler/index.js";
import { useOnClickOutside } from "../hooks/index.js";
import type { OptionsState } from "../types/index.js";
import { type Theme, TreeMode } from "../types/index.js";
import { enumUtils } from "../utils/index.js";
import { ExternalLink } from "./ExternalLink.js";

export interface OptionsProps {
  api: CompilerApi | undefined;
  options: OptionsState;
  onChange: (options: Partial<OptionsState>) => void;
}

export function Options(props: OptionsProps) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  useOnClickOutside(containerRef, () => setShowOptionsMenu(false));

  return (
    <div id="options" ref={containerRef}>
      <div id="optionsButton" onClick={() => setShowOptionsMenu(!showOptionsMenu)} role="button">
        Options
      </div>
      <div className="menuLine" hidden={!showOptionsMenu} />
      <div className="menu" hidden={!showOptionsMenu}>
        {getCompilerVersions()}
        {getTreeMode()}
        {getScriptKind()}
        {getScriptTarget()}
        {getBindingEnabled()}
        {getShowFactoryCode()}
        {getShowInternals()}
        {getTheme()}
        <div className="bottomLinks">
          <ExternalLink text="About" url="https://github.com/dsherret/ts-ast-viewer/tree/main/docs/about.md" />
          <span>&nbsp;|&nbsp;</span>
          <ExternalLink text="View on GitHub" url="https://github.com/dsherret/ts-ast-viewer" />
        </div>
      </div>
    </div>
  );

  function getCompilerVersions() {
    const selection = (
      <select
        id="compilerVersionSelection"
        value={props.options.compilerPackageName}
        onChange={(event) => onChange({ compilerPackageName: event.target.value as CompilerPackageNames })}
      >
        {compilerVersionCollection.map((v) => <option value={v.packageName} key={v.packageName}>{v.version}</option>)}
      </select>
    );
    return <Option name="Version" value={selection} />;
  }

  function getTreeMode() {
    const selection = (
      <select
        id="treeMode"
        value={props.options.treeMode}
        onChange={(event) => onChange({ treeMode: parseInt(event.target.value, 10) as TreeMode })}
      >
        <option value={TreeMode.forEachChild}>node.forEachChild(child =&gt; ...)</option>
        <option value={TreeMode.getChildren}>node.getChildren()</option>
      </select>
    );
    return <Option name="Tree mode" value={selection} />;
  }

  function getScriptKind() {
    const { api } = props;
    if (api == null) {
      return undefined;
    }
    return getEnumOption(
      "Script kind",
      "ts.ScriptKind",
      api.ScriptKind,
      props.options.scriptKind,
      (value) => onChange({ scriptKind: value as ScriptKind }),
    );
  }

  function getScriptTarget() {
    const { api } = props;
    if (api == null) {
      return undefined;
    }
    return getEnumOption(
      "Script target",
      "ts.ScriptTarget",
      api.ScriptTarget,
      props.options.scriptTarget,
      (value) => onChange({ scriptTarget: value as ScriptTarget }),
    );
  }

  function getBindingEnabled() {
    const selection = (
      <div>
        <input
          id="bindingEnabled"
          type="checkbox"
          checked={props.options.bindingEnabled}
          onChange={(event) => onChange({ bindingEnabled: !!event.target.checked })}
        />
      </div>
    );
    return <Option name="Binding" value={selection} />;
  }

  function getShowFactoryCode() {
    const selection = (
      <div>
        <input
          id="showFactoryCode"
          type="checkbox"
          checked={props.options.showFactoryCode}
          onChange={(event) => onChange({ showFactoryCode: !!event.target.checked })}
        />
      </div>
    );
    return <Option name="Factory code" value={selection} />;
  }

  function getTheme() {
    const selection = (
      <select
        id="theme"
        value={props.options.theme}
        onChange={(event) => onChange({ theme: event.target.value as Theme })}
      >
        <option value="os">OS</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    );
    return <Option name="Theme" value={selection} />;
  }

  function getShowInternals() {
    const selection = (
      <div>
        <input
          id="showInternals"
          type="checkbox"
          checked={props.options.showInternals}
          onChange={(event) => onChange({ showInternals: !!event.target.checked })}
        />
      </div>
    );
    return <Option name="Show internals" value={selection} />;
  }

  function getEnumOption(
    name: string,
    prefix: string,
    e: any,
    currentValue: number,
    onChange: (value: number) => void,
  ) {
    const selection = (
      <select value={currentValue} onChange={(event) => onChange(parseInt(event.target.value, 10))}>
        {enumUtils.getNamesForValues(e).map((namesForValue) => getOption(namesForValue.value, namesForValue.names))}
      </select>
    );
    return <Option name={name} value={selection} />;

    function getOption(value: number, names: string[]) {
      return <option value={value} key={value}>{prefix}.{names.join(" / ")}</option>;
    }
  }

  function onChange(options: Partial<OptionsState>) {
    props.onChange({ ...options });
  }
}

function Option(props: { name: string; value: React.ReactNode }) {
  return (
    <div className="option">
      <div className="optionName">{props.name}:</div>
      <div className="optionValue">
        {props.value}
      </div>
    </div>
  );
}
