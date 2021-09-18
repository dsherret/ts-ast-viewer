import { checkNode, forAllCompilerVersions, setEditorText, setShowInternals, setVersion, visitSite } from "../helpers";

forAllCompilerVersions(packageName => {
  describe(`should have internals hidden by default (${packageName})`, () => {
    before(() => {
      visitSite();
      setVersion(packageName);
      setEditorText("foo();");
    });

    checkNode({
      haveInternalProperties: false,
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
      haveInternalProperties: true,
    });
  });
});
