# TypeScript AST Viewer

[![CI](https://github.com/dsherret/ts-ast-viewer/workflows/CI/badge.svg)](https://github.com/dsherret/ts-ast-viewer/actions?query=workflow%3ACI)

Source code for https://ts-ast-viewer.com

## Developing

Install [Deno](https://deno.com).

```
# install packages
deno install

# build the TypeScript 7.0+ (tsgo) wasm + vendored client from typescript-go main.
# required for `deno task check` and for the "@next" version in the app. Needs Go
# and git; the outputs are gitignored.
deno task buildTsgo

# run locally
deno task dev

# run unit tests
deno task test
```

### Factory Code Generation

The code that code generates the factory code is automatically maintained by
[ts-factory-code-generator-generator](https://github.com/dsherret/ts-factory-code-generator-generator/).
