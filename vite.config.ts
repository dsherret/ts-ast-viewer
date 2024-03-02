import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  plugins: [
    react(),
    // types are wrong for this package
    (monacoEditorPlugin as any).default({}),
  ],
});
