import { checkFactoryCode, forAllCompilerVersions, setEditorText, setFactoryCodeEnabled, setVersion, visitSite } from "../helpers";

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
  factory.createExpressionStatement(factory.createCallExpression(
    factory.createIdentifier("foo"),
    undefined,
    []
  ))
];
`.replace(/\r?\n/g, "\n"));
  });
});
