// Verifies the patched tsgo.wasm boots under JSPI and serves a stateful
// `--api --async` JSON-RPC session, driven directly through bootTsgoWasm (no
// native-preview client). Skips if the wasm hasn't been built yet
// (`deno task buildTsgo`). Deno's V8 has WebAssembly JSPI enabled by default.
import { expect } from "@std/expect";
import * as path from "node:path";
import { bootTsgoWasm, jspiAvailable } from "./bootTsgoWasm.ts";

const wasmPath = path.resolve(import.meta.dirname!, "../../resources/tsgo/tsgo.wasm");

Deno.test("tsgo.wasm serves a stateful JSON-RPC session", async () => {
  if (!(await exists(wasmPath))) {
    console.warn(`skipping: ${wasmPath} not built (run \`deno task buildTsgo\`)`);
    return;
  }
  expect(jspiAvailable()).toBe(true);

  const fileName = "/ast-viewer.ts";
  const wasmModule = await WebAssembly.compile(await Deno.readFile(wasmPath));

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

async function exists(file: string) {
  try {
    await Deno.stat(file);
    return true;
  } catch {
    return false;
  }
}

/** Minimal JSON-RPC (LSP Content-Length framing) request/response driver. */
class JsonRpcDriver {
  onSend: (bytes: Uint8Array) => void = () => {};
  #nextId = 0;
  #pending = new Map<number, (result: unknown) => void>();
  #buffer = new Uint8Array(0);

  request(method: string, params: unknown): Promise<unknown> {
    const id = this.#nextId++;
    const body = JSON.stringify({ jsonrpc: "2.0", id, method, params });
    const frame = new TextEncoder().encode(`Content-Length: ${body.length}\r\n\r\n${body}`);
    return new Promise((resolve) => {
      this.#pending.set(id, resolve);
      this.onSend(frame);
    });
  }

  receive(bytes: Uint8Array) {
    const merged = new Uint8Array(this.#buffer.length + bytes.length);
    merged.set(this.#buffer);
    merged.set(bytes, this.#buffer.length);
    this.#buffer = merged;
    this.#drain();
  }

  #drain() {
    for (;;) {
      const text = new TextDecoder().decode(this.#buffer);
      const match = /Content-Length: (\d+)\r\n\r\n/.exec(text);
      if (!match) return;
      const headerEnd = match.index + match[0].length;
      const length = Number(match[1]);
      if (this.#buffer.length < headerEnd + length) return;
      const body = new TextDecoder().decode(this.#buffer.subarray(headerEnd, headerEnd + length));
      this.#buffer = this.#buffer.subarray(headerEnd + length);
      const message = JSON.parse(body) as { id?: number; result?: unknown };
      if (typeof message.id === "number" && this.#pending.has(message.id)) {
        this.#pending.get(message.id)!(message.result);
        this.#pending.delete(message.id);
      }
    }
  }
}
