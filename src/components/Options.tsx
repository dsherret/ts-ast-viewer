import React from "react";
import {TreeMode, OptionsState} from "../types";

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
                </div>
            </div>
        );
    }

    private getTreeMode() {
        return (
            <div className="option">
                <div className="optionName">Tree mode:</div>
                <div className="optionValue">
                    <select value={this.props.options.treeMode} onChange={(event) =>
                        this.props.onChange({ ...this.props.options, treeMode: parseInt(event.target.value, 10) as TreeMode })}>
                        <option value={TreeMode.getChildren}>node.getChildren()</option>
                        <option value={TreeMode.forEachChild}>ts.forEachKind(node, child => ...)</option>
                    </select>
                </div>
            </div>
        );
    }
}
