# TypeScript AST Viewer

[![CI](https://github.com/dsherret/ts-ast-viewer/workflows/CI/badge.svg)](https://github.com/dsherret/ts-ast-viewer/actions?query=workflow%3ACI)

Source code for https://ts-ast-viewer.com

## Developing

```
# install and setup
yarn setup

# run locally, this can take a long time to boot up
yarn start

# run unit tests
yarn test

# run cypress
yarn cypress
```

### Adding a new TypeScript version

1. Update _sites/package.json_ with new version.
2. Run `yarn updateCompilerFiles` in the root directory.

### Factory Code Generation

The code that code generates the factory code is automatically maintained by [ts-factory-code-generator-generator](https://github.com/dsherret/ts-factory-code-generator-generator/).
