// End-to-end per build: the client vendored with a tsgo wasm drives it over a JSON-RPC
// connection, materializes a real AST, and answers a checker query. Skips builds that
// aren't built.
import { expect } from "@std/expect";
import { compileTsgoWasm, tsgoBuilds } from "./testUtils.ts";
import { createTsgoApi } from "./tsgoApi.ts";

for (const build of tsgoBuilds) {
  Deno.test(`vendored TSGO API materializes an AST and resolves a type (${build.id})`, async () => {
    const wasmModule = await compileTsgoWasm(build);
    if (wasmModule == null) {
      return;
    }
    // install the vscode-jsonrpc RAL for this (Deno/Node) env; the browser build
    // installs `vscode-jsonrpc/browser` instead. Deferred past the skip so plain
    // `deno test` (no --allow-env) can still load this module and skip cleanly.
    await import("vscode-jsonrpc/node");

    const fileName = "/ast-viewer.ts";
    const vendor = await build.importVendor();
    const { api, dispose } = await createTsgoApi({
      vendor,
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
        if (node.kind === vendor.SyntaxKind.Identifier && !identifier) identifier = node;
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
}
