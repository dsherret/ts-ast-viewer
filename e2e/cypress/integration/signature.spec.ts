import { forAllCompilerVersions, visitSite, setVersion, setEditorText, selectNode, checkSignature } from "../helpers";

forAllCompilerVersions(packageName => {
    describe(`selecting a node with a signature (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("function test<T>(string: string) { return 5; }");
            selectNode("FunctionDeclaration");
        });

        // todo: more tests in the future
        checkSignature({
            minArgumentCount: 1
        })
    });
});
