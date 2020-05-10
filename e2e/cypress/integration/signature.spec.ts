import { forAllCompilerVersions, visitSite, setVersion, setEditorText, selectNode, checkSignature, setShowInternals } from "../helpers";

forAllCompilerVersions(packageName => {
    describe(`selecting a node with a signature (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            // temporary until better tests are developed (minArgumentCount should be removed because it's internal)
            setShowInternals(true);
            setEditorText("function test<T>(string: string) { return 5; }");
            selectNode("FunctionDeclaration");
        });

        after(() => {
            // revert for next tests
            setShowInternals(false);
        });

        // todo: more tests in the future
        checkSignature({
            minArgumentCount: 1,
        });
    });
});
