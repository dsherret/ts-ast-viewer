export default {
    fileName: `/lib.es2020.symbol.wellknown.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\n/// <reference lib="es2015.iterable" />\n/// <reference lib="es2015.symbol" />\ninterface SymbolConstructor{readonly matchAll:symbol;}interface RegExp{[Symbol.matchAll](str:string):IterableIterator<RegExpMatchArray>;}`
};