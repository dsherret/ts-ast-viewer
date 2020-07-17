import React from "react";
import { CompilerApi, ScriptKind, ScriptTarget, compilerVersionCollection, CompilerPackageNames } from "../compiler";
import { OptionsState, TreeMode } from "../types";
import { css as cssConstants } from "../constants";
import { EnumUtils } from "../utils";
import { ExternalLink } from "./ExternalLink";

export interface OptionsProps {
    api: CompilerApi | undefined;
    options: OptionsState;
    onChange: (options: Partial<OptionsState>) => void;
}

export class Options extends React.Component<OptionsProps, { showOptionsMenu: boolean }> {
    constructor(props: OptionsProps) {
        super(props);

        this.state = { showOptionsMenu: false };
    }

    render() {
        return (
            <div id={cssConstants.options.id}>
                <div id={cssConstants.options.buttonId} onClick={() => this.setState({ showOptionsMenu: !this.state.showOptionsMenu })}>
                    Options
                </div>
                <div className="menuLine" hidden={!this.state.showOptionsMenu} />
                <div className="menu" hidden={!this.state.showOptionsMenu}>
                    {this.getCompilerVersions()}
                    {this.getTreeMode()}
                    {this.getScriptKind()}
                    {this.getScriptTarget()}
                    {this.getBindingEnabled()}
                    {this.getShowFactoryCode()}
                    {this.getShowInternals()}
                    <div className="bottomLinks">
                        <ExternalLink text="About" url="https://github.com/dsherret/ts-ast-viewer/tree/master/docs/about.md" />
                        <span>&nbsp;|&nbsp;</span>
                        <ExternalLink text="View on GitHub" url="https://github.com/dsherret/ts-ast-viewer" />
                    </div>
                </div>
            </div>
        );
    }

    private getCompilerVersions() {
        const selection = (
            <select
                id={cssConstants.options.compilerVersionSelectionId}
                value={this.props.options.compilerPackageName}
                onChange={event => this.onChange({ compilerPackageName: event.target.value as CompilerPackageNames })}
            >
                {compilerVersionCollection.map(v => (<option value={v.packageName} key={v.packageName}>{v.version}</option>))}
            </select>
        );
        return (<Option name="Version" value={selection} />);
    }

    private getTreeMode() {
        const selection = (
            <select
                id={cssConstants.options.treeModeId}
                value={this.props.options.treeMode}
                onChange={event => this.onChange({ treeMode: parseInt(event.target.value, 10) as TreeMode })}
            >
                <option value={TreeMode.forEachChild}>node.forEachChild(child ={">"} ...)</option>
                <option value={TreeMode.getChildren}>node.getChildren()</option>
            </select>
        );
        return (<Option name="Tree mode" value={selection} />);
    }

    private getScriptKind() {
        const { api } = this.props;
        if (api == null)
            return undefined;
        return this.getEnumOption("Script kind", "ts.ScriptKind", api.ScriptKind, this.props.options.scriptKind,
            value => this.onChange({ scriptKind: value as ScriptKind }));
    }

    private getScriptTarget() {
        const { api } = this.props;
        if (api == null)
            return undefined;
        return this.getEnumOption("Script target", "ts.ScriptTarget", api.ScriptTarget, this.props.options.scriptTarget,
            value => this.onChange({ scriptTarget: value as ScriptTarget }));
    }

    private getBindingEnabled() {
        const selection = (
            <div>
                <input
                    id={cssConstants.options.bindingEnabledId}
                    type="checkbox"
                    checked={this.props.options.bindingEnabled}
                    onChange={event => this.onChange({ bindingEnabled: !!event.target.checked })}
                />
            </div>
        );
        return (<Option name={"Binding"} value={selection} />);
    }

    private getShowFactoryCode() {
        const selection = (
            <div>
                <input
                    id={cssConstants.options.showFactoryCodeId}
                    type="checkbox"
                    checked={this.props.options.showFactoryCode}
                    onChange={event => this.onChange({ showFactoryCode: !!event.target.checked })}
                />
            </div>
        );
        return (<Option name={"Factory code"} value={selection} />);
    }

    private getShowInternals() {
        const selection = (
            <div>
                <input
                    id={cssConstants.options.showInternalsId}
                    type="checkbox"
                    checked={this.props.options.showInternals}
                    onChange={event => this.onChange({ showInternals: !!event.target.checked })}
                />
            </div>
        );
        return (<Option name={"Show internals"} value={selection} />);
    }

    private getEnumOption(name: string, prefix: string, e: any, currentValue: number, onChange: (value: number) => void) {
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

    private onChange(options: Partial<OptionsState>) {
        this.props.onChange({ ...options });
    }
}

class Option extends React.Component<{ name: string; value: JSX.Element }> {
    render() {
        return (
            <div className="option">
                <div className="optionName">{this.props.name}:</div>
                <div className="optionValue">
                    {this.props.value}
                </div>
            </div>
        );
    }
}
