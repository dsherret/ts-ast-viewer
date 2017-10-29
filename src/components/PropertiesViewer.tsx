import * as React from "react";
import * as ts from "typescript";
import * as TreeView from "react-treeview";
import * as CircularJson from "circular-json";

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
                    <h3>Full Text</h3>
                    <pre>{selectedNode.getFullText(sourceFile)}</pre>
                    <h3>Text</h3>
                    {/* Need to do this because internally typescript doesn't pass the sourceFile to getStart() in TokenOrIdentifierObject (bug in ts) */}
                    <pre>{sourceFile.text.substring(selectedNode.getStart(sourceFile), selectedNode.getEnd())}</pre>
                </div>
            </div>
        );
    }
}

function getTreeView(parentNode: ts.Node) {
    const handledNodes: ts.Node[] = [];
    let pastFirst = false;
    let i = 0;

    return getTreeNode(parentNode);

    function getTreeNode(value: any): JSX.Element {
        const isNode = typeof (value as ts.Node).kind === "number";
        if (isNode) {
            const node = value as ts.Node;
            if (handledNodes.indexOf(node) >= 0 || parentNode.kind !== ts.SyntaxKind.SourceFile && node.kind === ts.SyntaxKind.SourceFile)
                return (<div>[Circular]</div>);
            handledNodes.push(node);
        }

        const disallowedKeys = ["parent", "_children"];
        const keyValues = Object.keys(value).filter(key => isNode && disallowedKeys.indexOf(key) === -1).map(key => ({ key, value: value[key] }));
        const label = typeof (value as ts.Node).kind === "number" ? ts.SyntaxKind[(value as ts.Node).kind] : "value";
        const isCollapsed = pastFirst;
        pastFirst = true;
        return (
            <TreeView nodeLabel={label} key={i++} defaultCollapsed={isCollapsed}>
                {keyValues.map(kv => (getNodeValue(kv.key, kv.value)))}
            </TreeView>
        );
    }

    function getNodeValue(key: string, value: any) {
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
                        <div className="value">{value.map(v => getTreeNode(v))}</div>
                        <div className="suffix">]</div>
                    </div>);
        }
        else if (typeof (value as ts.Node).kind === "number")
            return (
                <div className="object" key={key}>
                    <div className="key">{key}: {"{"}</div>
                    <div className="value">{getTreeNode(value as ts.Node)}</div>
                    <div className="suffix">{"}"}</div>
                </div>);
        else
            return (
                <div className="text" key={key}>
                    <div className="key">{key}:</div>
                    <div className="value">{CircularJson.stringify(value)}</div>
                </div>);
    }
}
