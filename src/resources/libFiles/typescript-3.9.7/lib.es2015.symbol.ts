export default {
    fileName: `/lib.es2015.symbol.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ninterface SymbolConstructor{readonly prototype:Symbol;(description?:string|number):symbol;for(key:string):symbol;keyFor(sym:symbol):string|undefined;}declare var Symbol:SymbolConstructor;`
};