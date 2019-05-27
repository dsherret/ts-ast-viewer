import { forAllCompilerVersions, visitSite, setVersion, setEditorText, setFactoryCodeEnabled, checkFactoryCode } from "../helpers";

forAllCompilerVersions(packageName => {
    describe(`factory code editor (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("foo();");
            setFactoryCodeEnabled(true);
        });

        after(() => {
            // revert for next tests
            setFactoryCodeEnabled(false);
        });

        checkFactoryCode(`[
  ts.createExpressionStatement(
    ts.createCall(ts.createIdentifier('foo'), undefined, [])
  )
];
`.replace(/\r?\n/g, "\n"))
    });

    // todo: should test changing the script kind to a non-tsx script kind
});
