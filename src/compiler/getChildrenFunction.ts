import { CommentNodeParser } from "@ts-morph/comment-parser"
import { Node, SourceFile } from "./CompilerApi";
import { TreeMode } from "../types";
import { assertNever } from "../utils";

export function getChildrenFunction(mode: TreeMode, sourceFile: SourceFile) {
    switch (mode) {
        case TreeMode.getChildrenWithComments:
            return (node: Node) => CommentNodeParser.getOrParseTokens(node, sourceFile);
        default:
            return assertNever(mode, `Unhandled mode: ${mode}`);
    }
}
