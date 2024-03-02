const fileData = {
    fileName: `/lib.es2018.asynciterable.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\n/// <reference lib=\"es2015.symbol\" />\n/// <reference lib=\"es2015.iterable\" />\ninterface SymbolConstructor{readonly asyncIterator:unique symbol;}interface AsyncIterator<T,TReturn=any,TNext=undefined>{next(...args:[]|[TNext]):Promise<IteratorResult<T,TReturn>>;return?(value?:TReturn|PromiseLike<TReturn>):Promise<IteratorResult<T,TReturn>>;throw?(e?:any):Promise<IteratorResult<T,TReturn>>;}interface AsyncIterable<T>{[Symbol.asyncIterator]():AsyncIterator<T>;}interface AsyncIterableIterator<T>extends AsyncIterator<T>{[Symbol.asyncIterator]():AsyncIterableIterator<T>;}"
};

export default fileData;