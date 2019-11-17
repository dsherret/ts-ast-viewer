export default {
    fileName: `/lib.es2018.asynciterable.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\n/// <reference lib="es2015.symbol" />\n/// <reference lib="es2015.iterable" />\ninterface SymbolConstructor{readonly asyncIterator:symbol;}interface AsyncIterator<T>{next(value?:any):Promise<IteratorResult<T>>;return?(value?:any):Promise<IteratorResult<T>>;throw?(e?:any):Promise<IteratorResult<T>>;}interface AsyncIterable<T>{[Symbol.asyncIterator]():AsyncIterator<T>;}interface AsyncIterableIterator<T>extends AsyncIterator<T>{[Symbol.asyncIterator]():AsyncIterableIterator<T>;}`
};