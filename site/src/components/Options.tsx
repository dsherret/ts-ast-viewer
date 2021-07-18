import { CompilerPackageNames, compilerVersionCollection, constants, TreeMode } from "@ts-ast-viewer/shared";
import React, { useRef, useState } from "react";
import { CompilerApi, ScriptKind, ScriptTarget } from "../compiler";
import { useOnClickOutside } from "../hooks";
import { OptionsState } from "../types";
import { EnumUtils } from "../utils";
import { ExternalLink } from "./ExternalLink";

export interface OptionsProps {
    api: CompilerApi | undefined;
    options: OptionsState;
    onChange: (options: Partial<OptionsState>) => void;
}

export function Options(props: OptionsProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);

    useOnClickOutside(containerRef, () => setShowOptionsMenu(false));

    return <div id={constants.css.options.id} ref={containerRef}>
        <div id={constants.css.options.buttonId} onClick={() => setShowOptionsMenu(!showOptionsMenu)} role="button">
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
            <div className="bottomLinks">
                <ExternalLink text="About" url="https://github.com/dsherret/ts-ast-viewer/tree/main/docs/about.md" />
                <span>&nbsp;|&nbsp;</span>
                <ExternalLink text="View on GitHub" url="https://github.com/dsherret/ts-ast-viewer" />
            </div>
        </div>
    </div>;

    function getCompilerVersions() {
        const selection = (
            <select
                id={constants.css.options.compilerVersionSelectionId}
                value={props.options.compilerPackageName}
                onChange={event => onChange({ compilerPackageName: event.target.value as CompilerPackageNames })}
            >
                {compilerVersionCollection.map(v => (<option value={v.packageName} key={v.packageName}>{v.version}</option>))}
            </select>
        );
        return (<Option name="Version" value={selection} />);
    }

    function getTreeMode() {
        const selection = (
            <select
                id={constants.css.options.treeModeId}
                value={props.options.treeMode}
                onChange={event => onChange({ treeMode: parseInt(event.target.value, 10) as TreeMode })}
            >
                <option value={TreeMode.forEachChild}>node.forEachChild(child ={">"} ...)</option>
                <option value={TreeMode.getChildren}>node.getChildren()</option>
            </select>
        );
        return (<Option name="Tree mode" value={selection} />);
    }

    function getScriptKind() {
        const { api } = props;
        if (api == null)
            return undefined;
        return getEnumOption("Script kind", "ts.ScriptKind", api.ScriptKind, props.options.scriptKind, value => onChange({ scriptKind: value as ScriptKind }));
    }

    function getScriptTarget() {
        const { api } = props;
        if (api == null)
            return undefined;
        return getEnumOption("Script target", "ts.ScriptTarget", api.ScriptTarget, props.options.scriptTarget,
            value => onChange({ scriptTarget: value as ScriptTarget }));
    }

    function getBindingEnabled() {
        const selection = (
            <div>
                <input
                    id={constants.css.options.bindingEnabledId}
                    type="checkbox"
                    checked={props.options.bindingEnabled}
                    onChange={event => onChange({ bindingEnabled: !!event.target.checked })}
                />
            </div>
        );
        return (<Option name={"Binding"} value={selection} />);
    }

    function getShowFactoryCode() {
        const selection = (
            <div>
                <input
                    id={constants.css.options.showFactoryCodeId}
                    type="checkbox"
                    checked={props.options.showFactoryCode}
                    onChange={event => onChange({ showFactoryCode: !!event.target.checked })}
                />
            </div>
        );
        return (<Option name={"Factory code"} value={selection} />);
    }

    function getShowInternals() {
        const selection = (
            <div>
                <input
                    id={constants.css.options.showInternalsId}
                    type="checkbox"
                    checked={props.options.showInternals}
                    onChange={event => onChange({ showInternals: !!event.target.checked })}
                />
            </div>
        );
        return (<Option name={"Show internals"} value={selection} />);
    }

    function getEnumOption(name: string, prefix: string, e: any, currentValue: number, onChange: (value: number) => void) {
        const selection = (
            <select value={currentValue} onChange={event => onChange(parseInt(event.target.value, 10))}>
                {EnumUtils.getNamesForValues(e).map(namesForValue => getOption(namesForValue.value, namesForValue.names))}
            </select>
        );
        return (<Option name={name} value={selection} />);

        function getOption(value: number, names: string[]) {
            return (<option value={value} key={value}>{prefix}.{names.join(" / ")}</option>);
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
