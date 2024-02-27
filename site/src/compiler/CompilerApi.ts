import { CompilerPackageNames } from "@ts-ast-viewer/shared";
import ts from "typescript";

export interface CompilerApi {
  createSourceFile: typeof ts.createSourceFile;
  createProgram: typeof ts.createProgram;
  getDefaultLibFileName: typeof ts.getDefaultLibFileName;
  forEachChild: typeof ts.forEachChild;
  ScriptTarget: typeof ts.ScriptTarget;
  ScriptKind: typeof ts.ScriptKind;
  SyntaxKind: typeof ts.SyntaxKind;
  ModifierFlags: typeof ts.ModifierFlags;
  ModuleKind: typeof ts.ModuleKind;
  NodeFlags: typeof ts.NodeFlags;
  ObjectFlags: typeof ts.ObjectFlags;
  SymbolFlags: typeof ts.SymbolFlags;
  TypeFlags: typeof ts.TypeFlags;
  FlowFlags: typeof ts.FlowFlags;
  // Internal enum
  CheckFlags: {};
  // Internal enum
  TransformFlags: {};
  // Internal enum
  TypeMapKind: {};
  tsAstViewer: {
    packageName: CompilerPackageNames;
    cachedSourceFiles: { [name: string]: SourceFile | undefined };
  };
  version: string;
  getLeadingCommentRanges: typeof ts.getLeadingCommentRanges;
  getTrailingCommentRanges: typeof ts.getTrailingCommentRanges;
}

export type Node = ts.Node;
export type Type = ts.Type;
export type Signature = ts.Signature;
export type SourceFile = ts.SourceFile;
export type Symbol = ts.Symbol;
export type Program = ts.Program;
export type TypeChecker = ts.TypeChecker;
export type CompilerOptions = ts.CompilerOptions;
export type ScriptTarget = ts.ScriptTarget;
export type ScriptKind = ts.ScriptKind;
export type NodeFlags = ts.NodeFlags;
export type ObjectFlags = ts.ObjectFlags;
export type SymbolFlags = ts.SymbolFlags;
export type TypeFlags = ts.TypeFlags;
export type SyntaxKind = ts.SyntaxKind;
export type CompilerHost = ts.CompilerHost;
export type CommentRange = ts.CommentRange;
export type FlowNode = ts.FlowNode;
