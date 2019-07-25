TypeScript AST Viewer
=====================

[![Build Status](https://travis-ci.org/dsherret/ts-ast-viewer.svg?branch=master)](https://travis-ci.org/dsherret/ts-ast-viewer)

Source code for https://ts-ast-viewer.com

## Developing

```
# install
yarn install

# run locally
yarn start

# run unit tests
yarn test

# run cypress
yarn cypress
```

### Adding a new TypeScript version

1. Update *package.json* with new version.
2. Run `yarn updateCompilerFiles`.

### Updating Monaco Editor

1. Update `react-monaco-editor` and `monaco-editor` packages.
2. Copy `node_modules/monaco-editor/min/vs` to `/public/vs`.
