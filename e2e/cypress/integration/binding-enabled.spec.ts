import { forAllCompilerVersions, visitSite, setVersion, setEditorText, setBindingEnabled, checkType, checkNode, checkSymbol,
    checkSignature } from "../helpers";

forAllCompilerVersions(packageName => {
    describe(`should be bound by default (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("class T {}");
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
            setBindingEnabled(false);
        });

        after(() => {
            // revert for next tests
            setBindingEnabled(true);
        });

        checkType(undefined);
        checkSymbol(undefined);
        checkSignature(undefined);
        checkNode({ isBound: false });
    });
});
