// Verifies the TSGO adapter renders through the app's getSyntaxKindName, and that a
// resident session re-parses an edited file WITHOUT re-booting the wasm (the second
// update reflects new code). Runs per build; skips ones that aren't built
// (`deno task buildTsgo`).
import { expect } from "@std/expect";
// getSyntaxKindName only type-imports the compiler barrel (erased at runtime), so
// it's safe to load headlessly; the tree walk below is exactly the forEachChild
// branch of getChildrenFunction, inlined to avoid dragging in the utils barrel
// (which pulls lz-string — fine in the Vite/browser build, not under Deno test).
import { getSyntaxKindName } from "../../utils/getSyntaxKindName.js";
import { compileTsgoWasm, tsgoBuilds } from "./testUtils.ts";
import { TsgoSession } from "./tsgoCompiler.ts";
import { createTsgoWasmSession } from "./tsgoWasmSession.ts";

for (const build of tsgoBuilds) {
  Deno.test(`TSGO resident session walks the tree and re-parses edits without rebooting (${build.id})`, async () => {
    const wasmModule = await compileTsgoWasm(build);
    if (wasmModule == null) {
      return;
    }
    const vendor = await build.importVendor();
    const wasm = await createTsgoWasmSession({ wasmModule, cwd: "/" });
    const session = new TsgoSession(wasm, build, vendor);

    try {
      // first edit
      const first = session.update({
        files: { "/main.ts": 'const message: string = "hello";\n' },
        currentFile: "/main.ts",
      });
      const firstKinds = collectKinds(first.api, first.sourceFile);
      expect(getSyntaxKindName(first.api, first.sourceFile.kind as any)).toBe("SourceFile");
      expect(firstKinds).toContain("StringKeyword");
      expect(firstKinds).not.toContain("NumericLiteral");

      const identifier = findKind(first.api, first.sourceFile, "Identifier");
      expect(identifier?.getText()).toBe("message");

      const checker = first.bindingTools.typeChecker as any;
      const type = checker.getTypeAtLocation(identifier);
      expect(checker.typeToString(type)).toBe("string");
      expect(typeof type.flags).toBe("number");
      const symbol = checker.getSymbolAtLocation(identifier);
      expect(symbol?.name).toBe("message");
      // a collection reads straight off the checker (string has properties)
      const props = checker.getPropertiesOfType(type);
      expect(Array.isArray(props)).toBe(true);
      expect(props.some((p: { name: string }) => p.name === "length")).toBe(true);

      // second edit on the SAME resident session — must reflect the new code
      const second = session.update({
        files: { "/main.ts": "const total = 42;\n" },
        currentFile: "/main.ts",
      });
      const secondKinds = collectKinds(second.api, second.sourceFile);
      expect(secondKinds).toContain("NumericLiteral");
      expect(secondKinds).not.toContain("StringKeyword");

      const total = findKind(second.api, second.sourceFile, "Identifier");
      expect(total?.getText()).toBe("total");
      // `const total = 42` narrows to the literal type 42 (proves the checker re-ran)
      const secondChecker = second.bindingTools.typeChecker as any;
      expect(secondChecker.typeToString(secondChecker.getTypeAtLocation(total))).toBe("42");

      // multi-file: the current file imports another; its type must resolve cross-file
      const multi = session.update({
        files: {
          "/helper.ts": 'export const greeting: string = "hi";\n',
          "/main.ts": 'import { greeting } from "./helper";\nconst reused = greeting;\n',
        },
        currentFile: "/main.ts",
      });
      const reused = findIdentifier(multi.api, multi.sourceFile, "reused");
      expect(reused).toBeDefined();
      // `reused = greeting` gets its type from the imported helper — proves cross-file resolution
      const multiChecker = multi.bindingTools.typeChecker as any;
      expect(multiChecker.typeToString(multiChecker.getTypeAtLocation(reused))).toBe("string");
    } finally {
      session.dispose();
    }
  });
}

function findIdentifier(api: any, sourceFile: any, text: string): any {
  let found: any;
  const visit = (node: any) => {
    if (!found && getSyntaxKindName(api, node.kind) === "Identifier" && node.getText() === text) found = node;
    node.forEachChild(visit);
  };
  visit(sourceFile);
  return found;
}

function collectKinds(api: any, sourceFile: any): string[] {
  const kinds: string[] = [];
  const visit = (node: any) => {
    kinds.push(getSyntaxKindName(api, node.kind));
    node.forEachChild(visit);
  };
  visit(sourceFile);
  return kinds;
}

function findKind(api: any, sourceFile: any, kindName: string): any {
  let found: any;
  const visit = (node: any) => {
    if (!found && getSyntaxKindName(api, node.kind) === kindName) found = node;
    node.forEachChild(visit);
  };
  visit(sourceFile);
  return found;
}
