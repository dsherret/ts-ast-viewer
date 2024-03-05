import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import * as monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  plugins: [
    react(),
    (monacoEditorPlugin as any).default.default({}),
  ],
});
