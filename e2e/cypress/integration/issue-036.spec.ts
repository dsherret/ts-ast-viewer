import { forAllCompilerVersions, visitSite, setVersion, setEditorText, selectNode, checkNode } from "../helpers";

forAllCompilerVersions(packageName => {
    // tests for issue #36
    describe(`adding an import or export declaration would cause a crash (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText(`import * as foo from 'foo';\nimport foo from 'foo';\nimport {foo} from 'foo';\nexport * from 'foo';`);
            selectNode("ImportDeclaration", "ImportClause", "NamespaceImport", "Identifier");
        });

        checkNode({
            name: "Identifier",
            pos: 11,
            end: 15,
            start: 12,
        });
    });
});
