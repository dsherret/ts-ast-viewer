import CircularJson from "circular-json";
import { type JSX, useEffect, useState } from "react";
import {
  type CommentRange,
  type CompilerApi,
  type FlowNode,
  getPublicApiInfo,
  getStartSafe,
  type Node,
  type PublicApiInfo,
  type Signature,
  type SourceFile,
  type Symbol,
  type Type,
  type TypeChecker,
} from "../compiler/index.js";
import type { BindingTools, CompilerState } from "../types/index.js";
import { enumUtils, getSyntaxKindName } from "../utils/index.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { FlowNodeGraph } from "./FlowNodeGraph.js";
import { LazyTreeView } from "./LazyTreeView.js";
import { Spinner } from "./Spinner.js";
import { ToolTippedText } from "./ToolTippedText.js";

export interface PropertiesViewerProps {
  compiler: CompilerState;
  sourceFile: SourceFile;
  bindingTools: () => BindingTools;
  selectedNode: Node;
  bindingEnabled: boolean;
  showInternals: boolean;
}

export function PropertiesViewer(props: PropertiesViewerProps) {
  const [publicApiInfo, setPublicApiInfo] = useState<PublicApiInfo | false | undefined>(undefined);

  useEffect(() => {
    setPublicApiInfo(undefined);

    getPublicApiInfo(props.compiler.packageName).then((publicApiInfo) => {
      setPublicApiInfo(publicApiInfo);
    }).catch((err) => {
      console.error(err);
      setPublicApiInfo(false);
    });
  }, [props.compiler.packageName]);

  const { selectedNode, sourceFile, bindingEnabled, bindingTools } = props;
  const context: Context = {
    api: props.compiler.api,
    publicApiInfo,
    showInternals: props.showInternals,
    sourceFile,
  };

  if (publicApiInfo == null) {
    return <Spinner />;
  }

  return (
    <div className="propertiesViewer">
      <div className="container">
        <h2>Node</h2>
        <div id="node">
          {getForSelectedNode(context, selectedNode)}
        </div>
        {bindingEnabled && getBindingSection(context, selectedNode, bindingTools().typeChecker)}
      </div>
    </div>
  );
}

interface Context {
  api: CompilerApi;
  publicApiInfo: PublicApiInfo | undefined | false;
  showInternals: boolean;
  sourceFile: SourceFile;
}

function getBindingSection(context: Context, selectedNode: Node, typeChecker: TypeChecker) {
  return (
    <>
      <h2>Type</h2>
      <div id="type">
        {getForType(context, selectedNode, typeChecker)}
      </div>
      <h2>Symbol</h2>
      <div id="symbol">
        {getForSymbol(context, selectedNode, typeChecker)}
      </div>
      <h2>Signature</h2>
      <div id="signature">
        {getForSignature(context, selectedNode, typeChecker)}
      </div>
      <h2>FlowNode</h2>
      <div>
        {getForFlowNode(context, selectedNode)}
      </div>
    </>
  );
}

function getForSelectedNode(context: Context, selectedNode: Node) {
  return (
    <LazyTreeView
      nodeLabel={getSyntaxKindName(context.api, selectedNode.kind)}
      defaultCollapsed={false}
      getChildren={getChildren}
    />
  );

  function getChildren() {
    const { sourceFile } = context;
    return (
      <>
        {getProperties(context, selectedNode)}
        {getMethodElement("getChildCount()", selectedNode.getChildCount(sourceFile))}
        {getMethodElement("getFullStart()", getPositionElement(sourceFile, selectedNode.getFullStart()))}
        {getMethodElement("getStart()", getPositionElement(sourceFile, selectedNode.getStart(sourceFile)))}
        {getMethodElement(
          "getStart(sourceFile, true)",
          getPositionElement(sourceFile, getStartSafe(selectedNode, sourceFile)),
        )}
        {getMethodElement("getFullWidth()", selectedNode.getFullWidth())}
        {getMethodElement("getWidth()", selectedNode.getWidth(sourceFile))}
        {getMethodElement("getLeadingTriviaWidth()", selectedNode.getLeadingTriviaWidth(sourceFile))}
        {getMethodElement("getFullText()", selectedNode.getFullText(sourceFile))}
        {/* Need to do this because internally typescript doesn't pass the sourceFile to getStart() in TokenOrIdentifierObject (bug in ts I need to report...) */}
        {getMethodElement(
          "getText()",
          sourceFile.text.substring(selectedNode.getStart(context.sourceFile), selectedNode.getEnd()),
        )}
        {/* comments */}
        {getForCommentRanges(
          `ts.getLeadingCommentRanges(fileFullText, ${selectedNode.getFullStart()})`,
          context.api.getLeadingCommentRanges(context.sourceFile.text, selectedNode.getFullStart()),
        )}
        {getForCommentRanges(
          `ts.getTrailingCommentRanges(fileFullText, ${selectedNode.end})`,
          context.api.getTrailingCommentRanges(context.sourceFile.text, selectedNode.end),
        )}
      </>
    );
  }

  function getMethodElement(name: string, result: string | number | JSX.Element) {
    return getTextDiv(name, typeof result === "number" ? JSON.stringify(result) : result);
  }

  function getForCommentRanges(name: string, commentRanges: CommentRange[] | undefined) {
    if (commentRanges == null) {
      return getTextDiv(name, "undefined");
    } else {
      return getArrayDiv(context, name, commentRanges);
    }
  }
}

function getForType(context: Context, node: Node, typeChecker: TypeChecker) {
  if (node.kind === context.api.SyntaxKind.SourceFile) {
    return <>[None]</>;
  }

  const type = getOrReturnError(() => typeChecker.getTypeAtLocation(node));
  if (type == null) {
    return <>[None]</>;
  }
  if (typeof type === "string") {
    return <>[Error getting type: {type}]</>;
  }

  return getTreeView(context, type, getTypeToString() || "Type");

  function getTypeToString() {
    try {
      return typeChecker.typeToString(type as Type, node);
    } catch (err) {
      return `[Problem getting type text: ${err}]`;
    }
  }
}

function getForSymbol(context: Context, node: Node, typeChecker: TypeChecker) {
  const symbol = getOrReturnError(() =>
    ((node as any).symbol as Symbol | undefined) || typeChecker.getSymbolAtLocation(node)
  );
  if (symbol == null) {
    return <>[None]</>;
  }
  if (typeof symbol === "string") {
    return <>[Error getting symbol: {symbol}]</>;
  }

  return getTreeView(context, symbol, getSymbolName() || "Symbol");

  function getSymbolName() {
    try {
      return (symbol as Symbol).getName();
    } catch (err) {
      return `[Problem getting symbol name: ${err}]`;
    }
  }
}

function getForSignature(context: Context, node: Node, typeChecker: TypeChecker) {
  const signature = getOrReturnError(() => typeChecker.getSignatureFromDeclaration(node as any));
  if (signature == null || typeof signature === "string") {
    return <>[None]</>;
  }

  return getTreeView(context, signature, "Signature");
}

function getForFlowNode(context: Context, node: Node) {
  const nodeWithFlowNode = node as Node & { flowNode?: FlowNode };
  if (nodeWithFlowNode.flowNode == null) {
    return <>[None]</>;
  }

  const flowNode = nodeWithFlowNode.flowNode;

  return (
    <>
      <ErrorBoundary getResetHash={() => nodeWithFlowNode.flowNode?.id?.toString() ?? ""}>
        <FlowNodeGraph flowNode={flowNode} api={context.api} />
      </ErrorBoundary>
      {getTreeView(context, nodeWithFlowNode.flowNode, "FlowNode")}
    </>
  );
}

function getOrReturnError<T>(getFunc: () => T): T | string {
  try {
    return getFunc();
  } catch (err) {
    return JSON.stringify(err);
  }
}

function getTreeView(context: Context, obj: any, label: string) {
  return <LazyTreeView nodeLabel={label} defaultCollapsed={false} getChildren={() => getProperties(context, obj)} />;
}

function getProperties(context: Context, obj: any) {
  const keyInfo = getObjectKeyInfo(context, obj);

  const values = (
    <>
      {keyInfo.map((info) => {
        const element = getNodeKeyValue(info.key, info.value, obj);
        if (info.permission === "internal") {
          return (
            <div className="internal" key={info.key} data-name={info.key}>
              {element}
            </div>
          );
        }
        return element;
      })}
    </>
  );
  return values;

  function getNodeKeyValue(key: string, value: any, parent: any): JSX.Element {
    if (value === null) {
      return getTextDiv(key, "null");
    } else if (value === undefined) {
      return getTextDiv(key, "undefined");
    } else if (value instanceof Array) {
      return getArrayDiv(context, key, value);
    } else if (isTsNode(value)) {
      return getNodeDiv(context, key, value);
    } else if (isMap(value)) {
      return getMapDiv(context, key, value);
    } else if (typeof value === "object") {
      return getObjectDiv(context, key, value);
    } else {
      return getCustomValueDiv(context, key, value, parent);
    }
  }
}

function getArrayDiv(context: Context, key: string, value: unknown[]) {
  if (value.length === 0) {
    return getTextDiv(key, "[]");
  } else {
    return (
      <div className="array" key={key} data-name={key}>
        <div className="key">{key}: [</div>
        <div className="value">{value.map((v, i) => getTreeNode(context, v, undefined, i))}</div>
        <div className="suffix">]</div>
      </div>
    );
  }
}

function getMapDiv(context: Context, key: string, value: ReadonlyMap<string, unknown>) {
  const entries = Array.from(value.entries());
  if (entries.length === 0) {
    return getTextDiv(key, "{}");
  } else {
    return (
      <div className="array" key={key} data-name={key}>
        <div className="key">{key}:{"{"}</div>
        <div className="value">{entries.map((v, i) => getTreeNode(context, v[1], v[0], i))}</div>
        <div className="suffix">{"}"}</div>
      </div>
    );
  }
}

function getObjectDiv(context: Context, key: string, value: unknown) {
  if (getObjectKeyInfo(context, value).length === 0) {
    return getTextDiv(key, "{}");
  } else {
    return (
      <div className="object" key={key} data-name={key}>
        <div className="key">{key}:</div>
        <div className="value">{getTreeNode(context, value)}</div>
      </div>
    );
  }
}

function getCustomValueDiv(context: Context, key: string, value: any, parent: any) {
  return (
    <div className="text" key={key} data-name={key}>
      <div className="key">{key}:</div>
      <div className="value">{getCustomValue()}</div>
    </div>
  );

  function getCustomValue() {
    if (isTsNode(parent)) {
      switch (key) {
        case "kind":
        case "token": // HeritageClause
          return `${value} (SyntaxKind.${getSyntaxKindName(context.api, value)})`;
        case "flags":
          return getEnumFlagElement(context.api.NodeFlags, value);
        case "pos":
        case "end":
          return getPositionElement(context.sourceFile, value);
        case "transformFlags":
          return getEnumFlagElement(context.api.TransformFlags, value);
        case "modifierFlagsCache":
          return getEnumFlagElement(context.api.ModifierFlags, value);
      }
    }
    if (isTsType(parent) && key === "objectFlags") {
      return getEnumFlagElement(context.api.ObjectFlags, value);
    }
    if (isTsType(parent) && key === "flags") {
      return getEnumFlagElement(context.api.TypeFlags, value);
    }
    if (isTsSymbol(parent) && key === "flags") {
      return getEnumFlagElement(context.api.SymbolFlags, value);
    }
    // TS pre-5.0 puts this on the symbol, TS 5.0 puts it on a plain "links" object
    if (key === "checkFlags" && typeof value === "number") {
      return getEnumFlagElement(context.api.CheckFlags, value);
    }
    if (key === "kind" && typeof value === "number") {
      return getEnumFlagElement(context.api.TypeMapKind, value);
    }
    if (isFlowNode(parent) && key === "flags") {
      return getEnumFlagElement(context.api.FlowFlags, value);
    }
    return CircularJson.stringify(value);
  }
}

function getNodeDiv(context: Context, key: string, value: Node) {
  return (
    <div className="object" key={key} data-name={key}>
      <div className="key">{key}:</div>
      <div className="value">{getTreeNode(context, value)}</div>
    </div>
  );
}

function getTextDiv(key: string | undefined, value: string | JSX.Element) {
  return (
    <div className="text" key={key} data-name={key}>
      {key == null ? undefined : <div className="key">{key}:</div>}
      <div className="value">{value}</div>
    </div>
  );
}

function getTreeNode(context: Context, value: any, key?: string, index?: number): JSX.Element {
  const labelName = getLabelName(context, value);
  key = getKey();

  if (typeof value === "string") {
    return getTextDiv(key, `"${value}"`);
  }
  if (typeof value === "number") {
    return getTextDiv(key, value.toString());
  }
  if (typeof value === "boolean") {
    return getTextDiv(key, value.toString());
  }
  return (
    <LazyTreeView
      nodeLabel={key}
      key={index}
      defaultCollapsed
      getChildren={() => getProperties(context, value)}
    />
  );

  function getKey() {
    if (key == null) {
      return labelName;
    } else if (labelName != null) {
      return `${key}: ${getLabelName(context, value)}`;
    }
    return key;
  }
}

function getLabelName(context: Context, obj: any) {
  if (obj == null) {
    return undefined;
  }
  if (isTsNode(obj)) {
    return appendName(getSyntaxKindName(context.api, obj.kind));
  }
  if (isTsSignature(obj)) {
    return appendName("Signature");
  }
  if (isTsType(obj)) {
    return appendName("Type");
  }
  if (isTsSymbol(obj)) {
    return appendName("Symbol");
  }
  const objType = typeof obj;
  if (objType === "string" || objType === "number" || objType === "boolean") {
    return undefined;
  }
  return appendName("Object");

  function appendName(title: string) {
    const name = getName();
    return name == null ? title : `${title} (${name})`;
  }

  function getName() {
    try {
      if (typeof obj.getName === "function") {
        return obj.getName();
      }
      if (isTsNode(obj) && (obj as any).name != null) {
        const name = (obj as any).name as Node;
        return name.getText();
      }
      return undefined;
    } catch (_err) {
      return undefined;
    }
  }
}

function getObjectKeyInfo(context: Context, obj: any) {
  if (obj == null) {
    return [];
  }
  return Object.keys(obj)
    .map((key) => ({
      key,
      permission: getKeyPermission(context, obj, key),
      value: obj[key],
    }))
    .filter((kv) => {
      if (kv.permission === false) {
        return false;
      }
      return context.showInternals || kv.permission !== "internal";
    });
}

const nodeDisallowedKeys = new Set(["parent", "_children", "symbol"]);
const typeDisallowedKeys = new Set(["checker", "symbol"]);
function getKeyPermission(context: Context, obj: any, key: string): true | false | "internal" {
  const { publicApiInfo } = context;
  if (isTsNode(obj)) {
    if (nodeDisallowedKeys.has(key)) {
      return false;
    }
    if (!publicApiInfo) {
      return true;
    }
    const kindName = getSyntaxKindName(context.api, obj.kind);
    return hasInProperties(publicApiInfo.nodePropertiesBySyntaxKind.get(kindName));
  }
  if (isTsType(obj)) {
    return !typeDisallowedKeys.has(key) && hasInProperties(publicApiInfo && publicApiInfo.typeProperties);
  }
  if (isTsSignature(obj)) {
    return hasInProperties(publicApiInfo && publicApiInfo.signatureProperties);
  }
  if (isTsSymbol(obj)) {
    return hasInProperties(publicApiInfo && publicApiInfo.symbolProperties);
  }
  return true;

  function hasInProperties(publicApiProperties: Set<string> | undefined | false) {
    if (!publicApiProperties) {
      return true;
    }
    return publicApiProperties.has(key) ? true : "internal";
  }
}

function isMap(value: any): value is ReadonlyMap<string, unknown> {
  return typeof value.keys === "function" &&
    typeof value.values === "function";
}

function isTsNode(value: any): value is Node {
  return typeof (value as Node).kind === "number" && typeof (value as Node).flags === "number";
}

function isTsType(value: any): value is Type {
  return (value as Type).getBaseTypes != null;
}

function isTsSymbol(value: any): value is Symbol {
  return (value as Symbol).getDeclarations != null;
}

function isTsSignature(value: any): value is Signature {
  if (value.declaration == null) {
    return false;
  }
  return isTsNode(value.declaration);
}

function isFlowNode(value: any): value is FlowNode {
  // TODO: FlowStart does not have antecedent(s)
  return value.antecedents != null || value.antecedent != null;
}

function getEnumFlagElement(enumObj: any, value: number) {
  const elements = enumUtils.getEnumFlagLines(enumObj, value);
  if (!elements) {
    return <>{value}</>;
  }

  return (
    <ToolTippedText text={value.toString()}>
      <ul>{elements.map((el, i) => <li key={i}>{el}</li>)}</ul>
    </ToolTippedText>
  );
}

function getPositionElement(sourceFile: SourceFile, pos: number) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
  return (
    <ToolTippedText text={pos.toString()}>
      <ul>
        <li>Line {line + 1}</li>
        <li>Column {character + 1}</li>
      </ul>
    </ToolTippedText>
  );
}
