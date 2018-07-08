import { forAllCompilerVersions, visitSite, setVersion, setEditorText, checkState } from "../helpers";

forAllCompilerVersions(packageName => {
    describe(`basic loading (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("console.log('test');");
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
                                    name: "Identifier"
                                }, {
                                    name: "DotToken"
                                }, {
                                    name: "Identifier"
                                }]
                            }, {
                                name: "OpenParenToken",
                            }, {
                                name: "SyntaxList",
                                children: [{
                                    name: "StringLiteral"
                                }]
                            }, {
                                name: "CloseParenToken",
                            }]
                        }, {
                            name: "SemicolonToken"
                        }]
                    }]
                }, {
                    name: "EndOfFileToken"
                }]
            },
            node: {
                name: "SourceFile",
                pos: 0,
                start: 0,
                end: 20
            }
        });
    });
});
