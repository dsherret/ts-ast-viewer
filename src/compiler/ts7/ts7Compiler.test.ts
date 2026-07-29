// Verifies the TS7 adapter renders through the app's getSyntaxKindName, and that a
// resident session re-parses an edited file WITHOUT re-booting the wasm (the second
// update reflects new code). Skips if the wasm isn't built (`deno task buildTsgo`).
import { expect } from "@std/expect";
import * as path from "node:path";
// getSyntaxKindName only type-imports the compiler barrel (erased at runtime), so
// it's safe to load headlessly; the tree walk below is exactly the forEachChild
// branch of getChildrenFunction, inlined to avoid dragging in the utils barrel
// (which pulls lz-string — fine in the Vite/browser build, not under Deno test).
import { getSyntaxKindName } from "../../utils/getSyntaxKindName.js";
import { Ts7Session } from "./ts7Compiler.ts";

const wasmPath = path.resolve(import.meta.dirname!, "../../resources/tsgo/tsgo.wasm");

Deno.test("TS7 resident session walks the tree and re-parses edits without rebooting", async () => {
  if (!(await exists(wasmPath))) {
    console.warn(`skipping: ${wasmPath} not built (run \`deno task buildTsgo\`)`);
    return;
  }
  await import("vscode-jsonrpc/node"); // install the RAL for this env (deferred past the skip)

  const wasmModule = await WebAssembly.compile(await Deno.readFile(wasmPath));
  const session = await Ts7Session.create(wasmModule);

  try {
    // first edit
    const first = await session.update({ code: 'const message: string = "hello";\n', scriptKind: 3, version: "7" });
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
    const second = await session.update({ code: "const total = 42;\n", scriptKind: 3, version: "7" });
    const secondKinds = collectKinds(second.api, second.sourceFile);
    expect(secondKinds).toContain("NumericLiteral");
    expect(secondKinds).not.toContain("StringKeyword");

    const total = findKind(second.api, second.sourceFile, "Identifier");
    expect(total?.getText()).toBe("total");
    // `const total = 42` narrows to the literal type 42 (proves the checker re-ran)
    const totalType = await second.asyncBinding.getType(total);
    expect(await second.asyncBinding.typeToString(totalType)).toBe("42");
  } finally {
    session.dispose();
  }
});

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

async function exists(file: string) {
  try {
    await Deno.stat(file);
    return true;
  } catch {
    return false;
  }
}
