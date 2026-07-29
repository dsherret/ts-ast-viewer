// The app's view of a vendored native-preview client. Every tsgo build vendors its own
// copy of the client from the typescript-go commit its wasm was built from (see
// scripts/buildTsgo.ts, which generates each `mod.ts`), so the app must load the copy
// that matches the selected build — its enums decode that wasm's nodes, types and
// symbols. The copies are the same code at different commits, so the nightly's is used
// as the type for all of them (their enums are nominally distinct, hence the cast in
// `toVendorLoader`).
import type * as nightlyVendor from "./vendor/nightly/mod.ts";

/** One build's vendored client: the async API class plus the enums for its wasm. */
export type TsgoVendor = typeof nightlyVendor;
/** A source file materialized out of the wasm by a vendored client. */
export type TsgoSourceFile = nightlyVendor.SourceFile;
/** A vendored client's session with a running tsgo wasm server. */
export type TsgoApi = nightlyVendor.API;

/** Type a build's `import("./vendor/<id>/mod.ts")` as the canonical vendor shape. */
export function toVendorLoader(load: () => Promise<unknown>): () => Promise<TsgoVendor> {
  return load as () => Promise<TsgoVendor>;
}
