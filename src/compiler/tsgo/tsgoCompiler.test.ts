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

for (const build of tsgoBuilds) {
  Deno.test(`TSGO resident session walks the tree and re-parses edits without rebooting (${build.id})`, async () => {
    const wasmModule = await compileTsgoWasm(build);
    if (wasmModule == null) {
      return;
    }
    await import("vscode-jsonrpc/node"); // install the RAL for this env (deferred past the skip)

    const vendor = await build.importVendor();
    const session = await TsgoSession.create({ build, vendor, wasmModule });

    try {
      // first edit
      const first = await session.update({
        files: { "/main.ts": 'const message: string = "hello";\n' },
        currentFile: "/main.ts",
      });
      const firstKinds = collectKinds(first.api, first.sourceFile);
      expect(getSyntaxKindName(first.api, first.sourceFile.kind as any)).toBe("SourceFile");
      expect(firstKinds).toContain("StringKeyword");
      expect(firstKinds).not.toContain("NumericLiteral");

      const identifier = findKind(first.api, first.sourceFile, "Identifier");
      expect(identifier?.getText()).toBe("message");

      const type = await first.asyncBinding.getType(identifier);
      expect(await first.asyncBinding.typeToString(type)).toBe("string");
      expect(typeof type.flags).toBe("number"); // sync scalar field on the proxy
      const symbol = await first.asyncBinding.getSymbol(identifier);
      expect(symbol?.name).toBe("message");
      // an async collection resolves through the checker (string has properties)
      const props = await first.asyncBinding.checker.getPropertiesOfType(type);
      expect(Array.isArray(props)).toBe(true);
      expect(props.some((p: { name: string }) => p.name === "length")).toBe(true);

      // second edit on the SAME resident session — must reflect the new code
      const second = await session.update({
        files: { "/main.ts": "const total = 42;\n" },
        currentFile: "/main.ts",
      });
      const secondKinds = collectKinds(second.api, second.sourceFile);
      expect(secondKinds).toContain("NumericLiteral");
      expect(secondKinds).not.toContain("StringKeyword");

      const total = findKind(second.api, second.sourceFile, "Identifier");
      expect(total?.getText()).toBe("total");
      // `const total = 42` narrows to the literal type 42 (proves the checker re-ran)
      const totalType = await second.asyncBinding.getType(total);
      expect(await second.asyncBinding.typeToString(totalType)).toBe("42");

      // multi-file: the current file imports another; its type must resolve cross-file
      const multi = await session.update({
        files: {
          "/helper.ts": 'export const greeting: string = "hi";\n',
          "/main.ts": 'import { greeting } from "./helper";\nconst reused = greeting;\n',
        },
        currentFile: "/main.ts",
      });
      const reused = findIdentifier(multi.api, multi.sourceFile, "reused");
      expect(reused).toBeDefined();
      // `reused = greeting` gets its type from the imported helper — proves cross-file resolution
      expect(await multi.asyncBinding.typeToString(await multi.asyncBinding.getType(reused))).toBe("string");
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
