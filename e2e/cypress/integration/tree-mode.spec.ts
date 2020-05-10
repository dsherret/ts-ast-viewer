import { forAllCompilerVersions, visitSite, setVersion, setEditorText, setTreeMode, checkState } from "../helpers";
import { TreeMode } from "../../../src/types";

forAllCompilerVersions(packageName => {
    describe(`getChildren tree mode (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setTreeMode(TreeMode.getChildren);
            setEditorText("console.log('test');");
        });

        after(() => {
            // revert for next tests
            setTreeMode(TreeMode.forEachChild);
        });

        checkState({
            treeView: {
                name: "SourceFile",
                selected: true,
                children: [{
                    name: "SyntaxList",
                    children: [{
                        name: "ExpressionStatement",
                        children: [{
                            name: "CallExpression",
                            children: [{
                                name: "PropertyAccessExpression",
                                children: [{
                                    name: "Identifier",
                                }, {
                                    name: "DotToken",
                                }, {
                                    name: "Identifier",
                                }],
                            }, {
                                name: "OpenParenToken",
                            }, {
                                name: "SyntaxList",
                                children: [{
                                    name: "StringLiteral",
                                }],
                            }, {
                                name: "CloseParenToken",
                            }],
                        }, {
                            name: "SemicolonToken",
                        }],
                    }],
                }, {
                    name: "EndOfFileToken",
                }],
            },
            node: {
                name: "SourceFile",
                pos: 0,
                start: 0,
                end: 20,
            },
            type: "none",
            symbol: "none",
            signature: "none",
        });
    });
});
