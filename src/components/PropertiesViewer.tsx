import React from "react";
import ts from "typescript";
import TreeView from "react-treeview";
import CircularJson from "circular-json";
import {getSyntaxKindName} from "../utils";

export interface PropertiesViewerProps {
    sourceFile: ts.SourceFile;
    selectedNode: ts.Node;
}

export class PropertiesViewer extends React.Component<PropertiesViewerProps> {
    render() {
        const {selectedNode, sourceFile} = this.props;
        const keyValues = Object.keys(selectedNode).map(key => ({ key, value: selectedNode[key] }));
        return (
            <div className="propertiesViewer">
                <div className="container">
                    <h2>Properties</h2>
                    {getTreeView(selectedNode)}
                    <h2>Methods</h2>
                    <ul className="methods">
                        <li>
                            <span className="method">getFullStart()</span>
                            <span className="result">{selectedNode.getFullStart()}</span>
                        </li>
                        <li>
                            <span className="method">getStart()</span>
                            <span className="result">{selectedNode.getStart(sourceFile)}</span>
                        </li>
                        <li>
                            <span className="method">getWidth()</span>
                            <span className="result">{selectedNode.getWidth(sourceFile)}</span>
                        </li>
                        <li>
                            <span className="method">getFullWidth()</span>
                            <span className="result">{selectedNode.getFullWidth()}</span>
                        </li>
                    </ul>
                    <h3>getFullText()</h3>
                    <pre>{selectedNode.getFullText(sourceFile)}</pre>
                    <h3>getText()</h3>
                    {/* Need to do this because internally typescript doesn't pass the sourceFile to getStart() in TokenOrIdentifierObject (bug in ts) */}
                    <pre>{sourceFile.text.substring(selectedNode.getStart(sourceFile), selectedNode.getEnd())}</pre>
                </div>
            </div>
        );
    }
}

function getTreeView(rootItem: any) {
    const handledNodes: ts.Node[] = [];
    let pastFirst = false;
    let i = 0;

    return getTreeNode(rootItem, undefined);

    function getTreeNode(value: any, parent: any): JSX.Element {
        if (isTsNode(value)) {
            if (handledNodes.indexOf(value) >= 0 || isTsNode(rootItem) && rootItem.kind !== ts.SyntaxKind.SourceFile && value.kind === ts.SyntaxKind.SourceFile)
                return (<div>[Circular]</div>);
            handledNodes.push(value);
        }

        const isNode = isTsNode(value);
        const disallowedKeys = ["parent", "_children"];
        const keyValues = Object.keys(value).filter(key => isNode && disallowedKeys.indexOf(key) === -1).map(key => ({ key, value: value[key] }));
        const label = typeof (value as ts.Node).kind === "number" ? getSyntaxKindName((value as ts.Node).kind) : "value";
        const isCollapsed = pastFirst;
        pastFirst = true;

        return (
            <TreeView nodeLabel={label} key={i++} defaultCollapsed={isCollapsed}>
                {keyValues.map(kv => (getNodeValue(kv.key, kv.value, value)))}
            </TreeView>
        );
    }

    function getNodeValue(key: string, value: any, parent: any) {
        if (value === null)
            return (
                <div className="text" key={key}>
                    <div className="key">{key}:</div>
                    <div className="value">null</div>
                </div>);
        else if (value === undefined)
            return (
                <div className="text" key={key}>
                    <div className="key">{key}:</div>
                    <div className="value">undefined</div>
                </div>);
        else if (value instanceof Array) {
            if (value.length === 0)
                return (
                    <div className="text" key={key}>
                        <div className="key">{key}:</div>
                        <div className="value">[]</div>
                    </div>);
            else
                return (
                    <div className="array" key={key}>
                        <div className="key">{key}: [</div>
                        <div className="value">{value.map(v => getTreeNode(v, value))}</div>
                        <div className="suffix">]</div>
                    </div>);
        }
        else if (isTsNode(value))
            return (
                <div className="object" key={key}>
                    <div className="key">{key}: {"{"}</div>
                    <div className="value">{getTreeNode(value, parent)}</div>
                    <div className="suffix">{"}"}</div>
                </div>);
        else
            return (
                <div className="text" key={key}>
                    <div className="key">{key}:</div>
                    <div className="value">{getCustomValue()}</div>
                </div>);

        function getCustomValue() {
            if (isTsNode(parent) && key === "kind")
                return `${value} (SyntaxKind.${getSyntaxKindName(value)})`;
            return CircularJson.stringify(value);
        }
    }
}

function isTsNode(value: any): value is ts.Node {
    return typeof (value as ts.Node).kind === "number";
}
