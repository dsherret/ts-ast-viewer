import { forAllCompilerVersions, visitSite, setVersion, setEditorText, checkNode, setShowInternals } from "../helpers";

forAllCompilerVersions(packageName => {
    describe(`should have internals hidden by default (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("foo();");
        });

        checkNode({
            haveScriptKindInternalProperty: false,
        });
    });

    describe(`show internals (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("foo();");
            setShowInternals(true);
        });

        after(() => {
            // revert for next tests
            setShowInternals(false);
        });

        checkNode({
            haveScriptKindInternalProperty: true,
        });
    });
});
