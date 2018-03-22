import React from "react";
import * as ts from "typescript";
import {OptionsState, TreeMode} from "../types";

export interface OptionsProps {
    options: OptionsState;
    onChange: (options: OptionsState) => void;
}

export class Options extends React.Component<OptionsProps, { showOptionsMenu: boolean; }> {
    constructor(props: OptionsProps) {
        super(props);

        this.state = { showOptionsMenu: false };
    }

    render() {
        return (
            <div className="options">
                <div className="optionsButton" onClick={() => this.setState({ showOptionsMenu: !this.state.showOptionsMenu })}>
                    Options
                </div>
                <div className="menuLine" hidden={!this.state.showOptionsMenu}></div>
                <div className="menu" hidden={!this.state.showOptionsMenu}>
                    {this.getTreeMode()}
                    {this.getScriptKind()}
                    {this.getScriptTarget()}
                </div>
            </div>
        );
    }

    private getTreeMode() {
        const selection = (
            <select value={this.props.options.treeMode} onChange={(event) =>
                this.props.onChange({ ...this.props.options, treeMode: parseInt(event.target.value, 10) as TreeMode })}>
                <option value={TreeMode.getChildren}>node.getChildren()</option>
                <option value={TreeMode.forEachChild}>ts.forEachKind(node, child => ...)</option>
            </select>
        );
        return (<Option name="Tree mode" value={selection} />)
    }

    private getScriptKind() {
        return this.getEnumOption("Script kind", "ts.ScriptKind", ts.ScriptKind, this.props.options.scriptKind,
            value => this.props.onChange({ ...this.props.options, scriptKind: value as ts.ScriptKind }));
    }

    private getScriptTarget() {
        return this.getEnumOption("Script target", "ts.ScriptTarget", ts.ScriptTarget, this.props.options.scriptTarget,
            value => this.props.onChange({ ...this.props.options, scriptTarget: value as ts.ScriptTarget }));
    }

    private getEnumOption(name: string, prefix: string, e: any, currentValue: number, onChange: (value: number) => void) {
        const selection = (
            <select value={currentValue} onChange={(event) => onChange(parseInt(event.target.value, 10))}>
                {Object.keys(e)
                    .filter(key => !isNaN(parseInt(key, 10)))
                    .map(kind => getOption(parseInt(kind, 10)))}
            </select>
        );
        return (<Option name={name} value={selection} />)

        function getOption(value: any) {
            return (<option value={value} key={value}>{prefix}.{e[value]}</option>);
        }
    }
}

class Option extends React.Component<{ name: string; value: JSX.Element; }> {
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
