# TypeScript AST Viewer

[![CI](https://github.com/dsherret/ts-ast-viewer/workflows/CI/badge.svg)](https://github.com/dsherret/ts-ast-viewer/actions?query=workflow%3ACI)

Source code for https://ts-ast-viewer.com

## Developing

Install [Deno](https://deno.com) canary (`deno upgrade --canary`).

```
# install packages
deno install

# run locally
deno task dev

# run unit tests
deno task test
```

### Factory Code Generation

The code that code generates the factory code is automatically maintained by
[ts-factory-code-generator-generator](https://github.com/dsherret/ts-factory-code-generator-generator/).
