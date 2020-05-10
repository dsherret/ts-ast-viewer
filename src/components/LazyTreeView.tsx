import TreeView from "react-treeview";
import React, { Component } from "react";

export interface LazyTreeViewState {
    collapsed: boolean;
}

export interface LazyTreeViewProps {
    defaultCollapsed: boolean;
    nodeLabel: React.ReactNode;
    getChildren: () => JSX.Element;
}

export class LazyTreeView extends Component<LazyTreeViewProps, LazyTreeViewState> {
    constructor(props: LazyTreeViewProps) {
        super(props);
        this.state = {
            collapsed: props.defaultCollapsed,
        };
        this.toggleState = this.toggleState.bind(this);
    }

    render() {
        if (this.state.collapsed)
            return (<TreeView nodeLabel={this.props.nodeLabel} collapsed={true} onClick={this.toggleState} />);
        else
            return (<TreeView nodeLabel={this.props.nodeLabel} collapsed={false} onClick={this.toggleState}>{this.props.getChildren()}</TreeView>);
    }

    toggleState() {
        this.setState({ collapsed: !this.state.collapsed });
    }
}
