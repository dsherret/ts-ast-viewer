import { forAllCompilerVersions, visitSite, setVersion, setEditorText, checkState } from "../helpers";

forAllCompilerVersions(packageName => {
    describe(`basic loading (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("class Test {}");
        });

        checkState({
            treeView: {
                name: "SourceFile",
                selected: true,
                children: [{
                    name: "ClassDeclaration",
                    children: [{
                        name: "Identifier",
                    }],
                }, {
                    name: "EndOfFileToken",
                }],
            },
            node: {
                name: "SourceFile",
                pos: 0,
                start: 0,
                end: 13,
            },
            type: "none",
            symbol: "none",
            signature: "none",
        });
    });
});
