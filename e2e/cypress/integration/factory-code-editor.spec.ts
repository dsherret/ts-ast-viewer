import { forAllCompilerVersions, visitSite, setVersion, setEditorText, toggleFactoryCode, checkFactoryCode} from "../helpers";

forAllCompilerVersions(packageName => {
    // todo: enable this after figuring out `toggleFactoryCode` (it might be working now... check again soon)
    describe.skip(`factory code editor (${packageName})`, () => {
        before(() => {
            visitSite();
            setVersion(packageName);
            setEditorText("foo();");
            toggleFactoryCode();
        });

        after(() => {
            // revert for next tests
            toggleFactoryCode();
        });

        checkFactoryCode(`ts.updateSourceFileNode(
  ts.createSourceFile('temporary.tsx', '', ts.ScriptTarget.Latest),
  [
    ts.createExpressionStatement(
      ts.createCall(ts.createIdentifier('foo'), undefined, [])
    )
  ]
);
`.replace(/\r?\n/g, "\n"))
    });

    // todo: should test changing the script kind to a non-tsx script kind
});
