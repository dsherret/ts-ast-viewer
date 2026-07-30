# TypeScript AST Viewer

[![CI](https://github.com/dsherret/ts-ast-viewer/workflows/CI/badge.svg)](https://github.com/dsherret/ts-ast-viewer/actions?query=workflow%3ACI)

Source code for https://ts-ast-viewer.com

## Developing

Install [Deno](https://deno.com).

```
# install packages
deno install

# build the TypeScript 7.0+ (tsgo) wasms + vendored clients from typescript-go: one
# from the latest release tag, one from main (the nightly). Required for
# `deno task check` and for the 7.0+ versions in the app. Needs Go and git; the
# outputs are gitignored. Add `--wasm-only=nightly` to build just one of the wasms
# (each takes a few minutes), or `--skip-wasm` for the clients alone.
deno task buildTsgo

# run locally
deno task dev

# run unit tests
deno task test
```

### Factory Code Generation

The code that code generates the factory code is automatically maintained by
[ts-factory-code-generator-generator](https://github.com/dsherret/ts-factory-code-generator-generator/).
