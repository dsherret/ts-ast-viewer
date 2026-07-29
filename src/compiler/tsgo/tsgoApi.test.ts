// End-to-end: the vendored async client drives tsgo.wasm over a JSON-RPC connection,
// materializes a real AST, and answers a checker query. Skips if the wasm isn't built.
import { expect } from "@std/expect";
import * as path from "node:path";
import { createTsgoApi } from "./tsgoApi.ts";

const wasmPath = path.resolve(import.meta.dirname!, "../../../public/tsgo.wasm");

Deno.test("vendored TSGO API materializes an AST and resolves a type", async () => {
  if (!(await exists(wasmPath))) {
    console.warn(`skipping: ${wasmPath} not built (run \`deno task buildTsgo\`)`);
    return;
  }
  // install the vscode-jsonrpc RAL for this (Deno/Node) env; the browser build
  // installs `vscode-jsonrpc/browser` instead. Deferred past the skip so plain
  // `deno test` (no --allow-env) can still load this module and skip cleanly.
  await import("vscode-jsonrpc/node");

  const fileName = "/ast-viewer.ts";
  const wasmModule = await WebAssembly.compile(await Deno.readFile(wasmPath));
  const { api, dispose } = await createTsgoApi({
    wasmModule,
    files: { [fileName]: "const x: number = 1;\n" },
  });

  try {
    const snapshot = await api.updateSnapshot({ openFiles: [fileName] });
    const project = await snapshot.getDefaultProjectForFile(fileName);
    expect(project).toBeDefined();

    const sourceFile = await project!.program.getSourceFile(fileName);
    expect(sourceFile).toBeDefined();

    // walk the materialized AST (forEachChild — TSGO has no getChildren())
    let nodeCount = 0;
    let identifier: { getText(): string } | undefined;
    const visit = (node: any) => {
      nodeCount++;
      if (node.kind === SyntaxKindIdentifier && !identifier) identifier = node;
      node.forEachChild(visit);
    };
    sourceFile!.forEachChild(visit);
    expect(nodeCount).toBeGreaterThan(0);
    expect(identifier?.getText()).toBe("x");

    // the async checker answers over the same resident program
    const checker = project!.checker;
    const type = await checker.getTypeAtLocation(identifier as any);
    expect(await checker.typeToString(type)).toBe("number");
  } finally {
    await dispose();
  }
});

// SyntaxKind.Identifier — avoids importing the enum just for one constant in the test.
const SyntaxKindIdentifier = 79;

async function exists(file: string) {
  try {
    await Deno.stat(file);
    return true;
  } catch {
    return false;
  }
}
