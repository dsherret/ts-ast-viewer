// Verifies each patched tsgo wasm boots under JSPI and serves a stateful `--api --async`
// JSON-RPC session, driven directly through bootTsgoWasm. Skips builds that aren't built.
import { expect } from "@std/expect";
import { bootTsgoWasm, jspiAvailable } from "./bootTsgoWasm.ts";
import { compileTsgoWasm, tsgoBuilds } from "./testUtils.ts";

for (const build of tsgoBuilds) {
  Deno.test(`tsgo wasm serves a stateful JSON-RPC session (${build.id})`, async () => {
    const wasmModule = await compileTsgoWasm(build);
    if (wasmModule == null) {
      return;
    }
    expect(jspiAvailable()).toBe(true);

    const fileName = "/ast-viewer.ts";
    const rpc = new JsonRpcDriver();
    const booted = await bootTsgoWasm({
      wasmModule,
      files: { [fileName]: "const x: number = 1;\n" },
      onStdout: (bytes) => rpc.receive(bytes),
    });
    rpc.onSend = (bytes) => booted.writeStdin(bytes);

    try {
      const init = await rpc.request("initialize", null) as { currentDirectory: string };
      expect(init.currentDirectory).toBe("/");

      const snapshot = await rpc.request("updateSnapshot", { openFiles: [fileName] }) as {
        projects: { rootFiles: string[] }[];
      };
      expect(snapshot.projects.length).toBeGreaterThan(0);
      expect(snapshot.projects.some((p) => p.rootFiles.some((f) => f.includes("ast-viewer.ts")))).toBe(true);

      // a further request on the same resident server proves the session persists
      // (the wasm parked on stdin between requests and resumed via JSPI)
      const snapshot2 = await rpc.request("updateSnapshot", { openFiles: [fileName] }) as {
        projects: unknown[];
      };
      expect(snapshot2.projects.length).toBeGreaterThan(0);
    } finally {
      // let the wasm's stdin reader stay parked; the test process just exits
    }
  });
}

/** Minimal JSON-RPC (LSP Content-Length framing) request/response driver. */
class JsonRpcDriver {
  onSend: (bytes: Uint8Array) => void = () => {};
  private nextId = 0;
  private pending = new Map<number, (result: unknown) => void>();
  private buffer = new Uint8Array(0);

  request(method: string, params: unknown): Promise<unknown> {
    const id = this.nextId++;
    const body = JSON.stringify({ jsonrpc: "2.0", id, method, params });
    const frame = new TextEncoder().encode(`Content-Length: ${body.length}\r\n\r\n${body}`);
    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      this.onSend(frame);
    });
  }

  receive(bytes: Uint8Array) {
    const merged = new Uint8Array(this.buffer.length + bytes.length);
    merged.set(this.buffer);
    merged.set(bytes, this.buffer.length);
    this.buffer = merged;
    this.drain();
  }

  private drain() {
    for (;;) {
      const text = new TextDecoder().decode(this.buffer);
      const match = /Content-Length: (\d+)\r\n\r\n/.exec(text);
      if (!match) return;
      const headerEnd = match.index + match[0].length;
      const length = Number(match[1]);
      if (this.buffer.length < headerEnd + length) return;
      const body = new TextDecoder().decode(this.buffer.subarray(headerEnd, headerEnd + length));
      this.buffer = this.buffer.subarray(headerEnd + length);
      const message = JSON.parse(body) as { id?: number; result?: unknown };
      if (typeof message.id === "number" && this.pending.has(message.id)) {
        this.pending.get(message.id)!(message.result);
        this.pending.delete(message.id);
      }
    }
  }
}
