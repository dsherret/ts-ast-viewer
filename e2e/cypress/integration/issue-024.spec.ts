import { forAllCompilerVersions, visitSite, setVersion, setEditorText, selectNode, checkNode } from "../helpers";

forAllCompilerVersions(packageName => {
    // tests for issue #24
    describe(`clicking a node that has a null type (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("const t: Testing;");
            selectNode("VariableStatement", "VariableDeclaration", "TypeReference", "Identifier");
        });

        checkNode({
            name: "Identifier",
            pos: 8,
            end: 16,
            start: 9,
        });
    });
});
