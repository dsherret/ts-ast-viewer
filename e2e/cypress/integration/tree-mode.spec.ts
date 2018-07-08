import { forAllCompilerVersions, visitSite, setVersion, setEditorText, setTreeMode, checkState } from "../helpers";
import { TreeMode } from "../../../src/types";

forAllCompilerVersions(packageName => {
    describe(`forEachKind tree mode (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setTreeMode(TreeMode.forEachChild);
            setEditorText("class Test {}");
        });

        checkState({
            treeView: {
                name: "SourceFile",
                selected: true,
                children: [{
                    name: "ClassDeclaration",
                    children: [{
                        name: "Identifier"
                    }]
                }, {
                    name: "EndOfFileToken"
                }]
            },
            node: {
                name: "SourceFile",
                pos: 0,
                start: 0,
                end: 13
            }
        });
    });
});
