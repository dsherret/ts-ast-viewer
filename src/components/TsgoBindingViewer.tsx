// Renders the Type and Symbol for the selected node when using tsgo. The checker is
// synchronous (the wasm is a reactor driven by plain calls — see tsgoWasmSession.ts), so
// this reads much like the classic binding section; tsgo's Type/Symbol are handle-based
// objects with their own field shapes, which is why they get their own viewer. On expand,
// a node's collections are evaluated and only the non-empty ones shown; recursion stays
// bounded (nested collections wait for expand).
import type { JSX } from "react";
import type { CompilerApi, Node } from "../compiler/index.js";
import { enumUtils, getSyntaxKindName } from "../utils/index.js";
import { LazyTreeView } from "./LazyTreeView.js";
import { ToolTippedText } from "./ToolTippedText.js";

/** Arrays/collections with more than this many items start collapsed. */
const COLLAPSE_THRESHOLD = 10;

export interface TsgoBindingViewerProps {
  api: CompilerApi;
  // deno-lint-ignore no-explicit-any
  checker: any;
  node: Node;
  showInternals: boolean;
}

export function TsgoBindingViewer(props: TsgoBindingViewerProps) {
  const { api, checker, node } = props;
  const type = isSourceFile(api, node) ? undefined : call(checker.getTypeAtLocation, checker, node);
  const symbol = call(checker.getSymbolAtLocation, checker, node);
  return (
    <>
      <h2>Type</h2>
      <div id="type">
        {type == null ? <>[None]</> : <TypeNode key={"type-" + nodeKey(node)} {...props} type={type} open />}
      </div>
      <h2>Symbol</h2>
      <div id="symbol">
        {symbol == null ? <>[None]</> : <SymbolNode key={"symbol-" + nodeKey(node)} {...props} symbol={symbol} open />}
      </div>
    </>
  );
}

interface NodeProps {
  api: CompilerApi;
  // deno-lint-ignore no-explicit-any
  checker: any;
  showInternals: boolean;
  open?: boolean;
}

function TypeNode(props: NodeProps & { type: any }) {
  const { api, checker, type, showInternals } = props;
  const label = call(checker.typeToString, checker, type) ?? "Type";
  return (
    <LazyTreeView
      nodeLabel={label}
      defaultCollapsed={!props.open}
      getChildren={() => (
        <>
          {syncFields(api, type, "type", showInternals)}
          <Collections collections={typeCollections(props, type)} />
        </>
      )}
    />
  );
}

function SymbolNode(props: NodeProps & { symbol: any }) {
  const { api, symbol, showInternals } = props;
  return (
    <LazyTreeView
      nodeLabel={symbol.name || "Symbol"}
      defaultCollapsed={!props.open}
      getChildren={() => (
        <>
          {syncFields(api, symbol, "symbol", showInternals)}
          <Collections collections={symbolCollections(props, symbol)} />
        </>
      )}
    />
  );
}

// --- collections ----------------------------------------------------------

interface Collection {
  label: string;
  /** Read the collection; may be an object, array, Map, or undefined. */
  load: () => any;
  render: (item: any) => JSX.Element;
}

function typeCollections(props: NodeProps, type: any): Collection[] {
  const c = props.checker;
  const asType = (t: any) => <TypeNode {...props} type={t} open={false} />;
  const asSymbol = (s: any) => <SymbolNode {...props} symbol={s} open={false} />;
  const signatureKind = (props.api as any).SignatureKind;
  return [
    { label: "symbol", load: () => call(type.getSymbol), render: asSymbol },
    { label: "aliasSymbol", load: () => call(type.getAliasSymbol), render: asSymbol },
    { label: "target", load: () => call(type.getTarget), render: asType },
    { label: "apparentType", load: () => call(c.getApparentType, c, type), render: asType },
    { label: "properties", load: () => call(c.getPropertiesOfType, c, type), render: asSymbol },
    { label: "typeArguments", load: () => call(c.getTypeArguments, c, type), render: asType },
    { label: "baseTypes", load: () => call(type.getBaseTypes), render: asType },
    { label: "types", load: () => call(type.getTypes), render: asType },
    { label: "typeParameters", load: () => call(type.getTypeParameters), render: asType },
    {
      label: "callSignatures",
      load: () => call(c.getSignaturesOfType, c, type, signatureKind?.Call),
      render: renderSignature,
    },
    {
      label: "constructSignatures",
      load: () => call(c.getSignaturesOfType, c, type, signatureKind?.Construct),
      render: renderSignature,
    },
    {
      label: "indexInfos",
      load: () => call(c.getIndexInfosOfType, c, type),
      render: (info) => <ObjectFields api={props.api} obj={info} kind="type" showInternals={props.showInternals} />,
    },
  ];
}

function symbolCollections(props: NodeProps, symbol: any): Collection[] {
  const c = props.checker;
  const asType = (t: any) => <TypeNode {...props} type={t} open={false} />;
  const asSymbol = (s: any) => <SymbolNode {...props} symbol={s} open={false} />;
  return [
    { label: "type", load: () => call(c.getTypeOfSymbol, c, symbol), render: asType },
    { label: "parent", load: () => call(symbol.getParent), render: asSymbol },
    { label: "members", load: () => call(symbol.getMembers), render: asSymbol },
    { label: "exports", load: () => call(symbol.getExports), render: asSymbol },
  ];
}

/** Evaluate every collection (on expand), then show the non-empty ones. */
function Collections(props: { collections: Collection[] }) {
  // This component only mounts when its parent node is expanded, so the work is
  // bounded to what the user actually opened.
  const resolved = props.collections
    .map((c) => ({ label: c.label, render: c.render, items: toItems(c.load()) }))
    .filter((r) => r.items.length > 0);
  return (
    <>
      {resolved.map((r) => (
        <LazyTreeView
          key={r.label}
          nodeLabel={r.items.length > 1 ? `${r.label} (${r.items.length})` : r.label}
          defaultCollapsed={r.items.length > COLLAPSE_THRESHOLD}
          getChildren={() => <>{r.items.map((item, i) => <div key={i}>{r.render(item)}</div>)}</>}
        />
      ))}
    </>
  );
}

/** Normalize an object / array / Map / undefined result to a list of items. */
function toItems(value: any): any[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (value instanceof Map) return Array.from(value.values());
  return [value];
}

function renderSignature(): JSX.Element {
  return <span>Signature</span>;
}

// --- field rendering ------------------------------------------------------

// handle-number pointers (resolved instead via the collections above) and internals
const HIDDEN_KEYS = new Set([
  "objectRegistry",
  "canonicalProject",
  "membersCache",
  "exportsCache",
  "checker",
  "symbol",
  "aliasSymbol",
  "target",
  "freshType",
  "regularType",
  "objectType",
  "indexType",
  "checkType",
  "extendsType",
  "baseType",
  "substConstraint",
  "typeParameters",
  "outerTypeParameters",
  "localTypeParameters",
  "aliasTypeArguments",
  "parent",
  "exportSymbol",
  "path",
  "index",
  // lazily filled caches on the type proxy — `false` until fetched, and afterwards a
  // duplicate of what the collections already show
  "apparentType",
  "apparentProperties",
  "properties",
  "callSignatures",
  "constructSignatures",
  "indexInfos",
  "baseTypes",
  "stringIndexType",
  "numberIndexType",
  "constraint",
  "default",
  "nonNullableType",
  "trueType",
  "falseType",
]);

function ObjectFields(props: { api: CompilerApi; obj: any; kind: "type" | "symbol"; showInternals: boolean }) {
  return <>{syncFields(props.api, props.obj, props.kind, props.showInternals)}</>;
}

function syncFields(api: CompilerApi, obj: any, kind: "type" | "symbol", showInternals: boolean): JSX.Element[] {
  return Object.keys(obj)
    .filter((key) => !HIDDEN_KEYS.has(key) && typeof obj[key] !== "function")
    // treat underscore-prefixed fields as internal (hidden unless "Show internals")
    .filter((key) => showInternals || !key.startsWith("_"))
    .map((key) => fieldDiv(api, key, obj[key], kind, key.startsWith("_")))
    .filter((el): el is JSX.Element => el != null);
}

function fieldDiv(
  api: CompilerApi,
  key: string,
  value: any,
  kind: "type" | "symbol",
  internal: boolean,
): JSX.Element | null {
  const el = fieldValueDiv(api, key, value, kind);
  if (el == null || !internal) return el;
  return <div className="internal" key={key} data-name={key}>{el}</div>;
}

function fieldValueDiv(api: CompilerApi, key: string, value: any, kind: "type" | "symbol"): JSX.Element | null {
  const a = api as any;
  if (key === "flags") return textDiv(key, flagsElement(kind === "type" ? a.TypeFlags : a.SymbolFlags, value));
  if (key === "objectFlags") return textDiv(key, flagsElement(a.ObjectFlags, value));
  if (key === "elementFlags" && Array.isArray(value)) {
    return textDiv(key, <ul>{value.map((f, i) => <li key={i}>{flagsElement(a.ElementFlags, f)}</li>)}</ul>);
  }
  if (key === "declarations" && Array.isArray(value)) {
    return textDiv(key, value.length === 0 ? "[]" : value.map((d) => declarationName(api, d)).join(", "));
  }
  if (key === "valueDeclaration" && value != null) return textDiv(key, declarationName(api, value));
  // arrays of objects hold proxies (symbols, types, ...) that reference the project, which
  // is cyclic — leave them to the collections rather than serializing them
  if (Array.isArray(value)) return isScalarArray(value) ? textDiv(key, JSON.stringify(value)) : null;
  if (value != null && typeof value === "object") return null; // nested objects handled by the collections
  return textDiv(key, formatScalar(value));
}

function declarationName(api: CompilerApi, handle: any): string {
  if (handle != null && typeof handle.kind === "number") return getSyntaxKindName(api, handle.kind);
  return String(handle);
}

function flagsElement(enumObj: any, value: number): JSX.Element {
  const lines = enumObj == null ? undefined : enumUtils.getEnumFlagLines(enumObj, value);
  if (!lines || lines.length === 0) return <>{value}</>;
  return (
    <ToolTippedText text={value.toString()}>
      <ul>{lines.map((line, i) => <li key={i}>{line}</li>)}</ul>
    </ToolTippedText>
  );
}

function isScalarArray(value: any[]): boolean {
  return value.every((item) => item == null || typeof item !== "object");
}

function formatScalar(value: any): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  // bigint literal types carry a real bigint, which JSON.stringify refuses to serialize
  if (typeof value === "bigint") return `${value}n`;
  return JSON.stringify(value);
}

function textDiv(key: string, value: string | JSX.Element): JSX.Element {
  return (
    <div className="text" key={key} data-name={key}>
      <div className="key">{key}:</div>
      <div className="value">{value}</div>
    </div>
  );
}

// --- misc helpers ----------------------------------------------------------

/** Call an optional handle/checker method defensively, tolerating a throw. */
// deno-lint-ignore no-explicit-any
function call(fn: any, thisArg?: any, ...args: any[]): any {
  if (typeof fn !== "function") return undefined;
  try {
    return fn.apply(thisArg, args);
  } catch {
    return undefined;
  }
}

function isSourceFile(api: CompilerApi, node: Node): boolean {
  return node.kind === (api.SyntaxKind as any).SourceFile;
}

function nodeKey(node: Node): string {
  return `${node.kind}:${(node as any).pos}:${(node as any).end}`;
}
