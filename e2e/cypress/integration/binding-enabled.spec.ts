import { forAllCompilerVersions, visitSite, setVersion, setEditorText, setBindingEnabled, checkType, checkNode, checkSymbol, checkSignature,
    setShowInternals } from "../helpers";

forAllCompilerVersions(packageName => {
    describe(`should be bound by default (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            // these tests need to show the internals in order to tell if it's bound
            setShowInternals(true);
            setEditorText("class T {}");
        });

        after(() => {
            // revert for next tests
            setShowInternals(false);
        });

        checkType("none");
        checkSymbol("none");
        checkSignature("none");
        checkNode({ isBound: true });
    });

    describe(`setting binding as disabled should not show the type, symbol, and signature area (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("class T {}");
            setShowInternals(true);
            setBindingEnabled(false);
        });

        after(() => {
            // revert for next tests
            setBindingEnabled(true);
            setShowInternals(false);
        });

        checkType(undefined);
        checkSymbol(undefined);
        checkSignature(undefined);
        checkNode({ isBound: false });
    });
});
