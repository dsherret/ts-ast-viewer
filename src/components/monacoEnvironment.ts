// Tells monaco how to spawn its web workers. Monaco's esm build has no default for this
// once its modules are bundled, so without it the language service silently falls back to
// running on the main thread (or not at all) — no auto complete, no diagnostics.
// Loaded dynamically alongside monaco itself so the workers stay out of the main bundle.
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

export function setUpMonacoEnvironment() {
  (globalThis as any).MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      switch (label) {
        case "typescript":
        case "javascript":
          return new TsWorker();
        default:
          return new EditorWorker();
      }
    },
  };
}
