import { forAllCompilerVersions, visitSite, setVersion, setEditorText, selectNode, checkNode } from "../helpers";

forAllCompilerVersions(packageName => {
    // tests for issue #19
    describe(`large amount of information (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("const doc = window.document;");
            selectNode("VariableStatement", "VariableDeclaration", "PropertyAccessExpression", "Identifier");
        });

        checkNode({
            name: "Identifier",
            pos: 11,
            end: 18,
            start: 12,
        });
    });
});
