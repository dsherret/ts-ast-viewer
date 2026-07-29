// Stands in for vite's `?worker` imports during `deno check` (see the mapping in
// deno.jsonc). Vite itself resolves those specifiers to a generated worker constructor,
// so this module is never evaluated — it only supplies the type.
declare const WorkerConstructor: { new (options?: { name?: string }): Worker };
export default WorkerConstructor;
