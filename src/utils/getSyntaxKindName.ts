import { CommentNodeParser, CommentListKind } from "@ts-morph/comment-parser";
import { CompilerApi, Node } from "../compiler";

export function getSyntaxKindName(api: CompilerApi, node: Node) {
    if (CommentNodeParser.isCommentList(node))
        return "CommentList" + CommentListKind[node.commentListKind];
    return getKindCacheForApi(api)[node.kind];
}

const kindCache: { [packageName: string]: { [kind: number]: string; }; } = {};

function getKindCacheForApi(api: CompilerApi) {
    if (kindCache[api.tsAstViewer.packageName] == null)
        kindCache[api.tsAstViewer.packageName] = getKindNamesForApi(api);
    return kindCache[api.tsAstViewer.packageName];
}

function getKindNamesForApi(api: CompilerApi) {
    // some SyntaxKinds are repeated, so only use the first one
    const kindNames: { [kind: number]: string; } = {};
    for (const name of Object.keys(api.SyntaxKind).filter(k => isNaN(parseInt(k, 10)))) {
        const value = (api.SyntaxKind as any)[name] as number;
        if (kindNames[value] == null)
            kindNames[value] = name;
    }
    return kindNames;
}
