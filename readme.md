# TypeScript AST Viewer

[![Build Status](https://travis-ci.org/dsherret/ts-ast-viewer.svg?branch=master)](https://travis-ci.org/dsherret/ts-ast-viewer)

Source code for https://ts-ast-viewer.com

## Developing

```
# install
yarn install

# run locally, this can take a long time to boot up
yarn start

# run unit tests
yarn test

# run cypress
yarn cypress
```

### Adding a new TypeScript version

1. Update _package.json_ with new version.
2. Run `yarn updateCompilerFiles`.

### Factory Code Generation

The code that code generates the factory code is automatically maintained by [ts-factory-code-generator-generator](https://github.com/dsherret/ts-factory-code-generator-generator/).
