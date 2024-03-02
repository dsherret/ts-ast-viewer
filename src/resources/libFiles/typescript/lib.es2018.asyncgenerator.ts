const fileData = {
    fileName: `/lib.es2018.asyncgenerator.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\n/// <reference lib=\"es2018.asynciterable\" />\ninterface AsyncGenerator<T=unknown,TReturn=any,TNext=unknown>extends AsyncIterator<T,TReturn,TNext>{next(...args:[]|[TNext]):Promise<IteratorResult<T,TReturn>>;return(value:TReturn|PromiseLike<TReturn>):Promise<IteratorResult<T,TReturn>>;throw(e:any):Promise<IteratorResult<T,TReturn>>;[Symbol.asyncIterator]():AsyncGenerator<T,TReturn,TNext>;}interface AsyncGeneratorFunction{new(...args:any[]):AsyncGenerator;(...args:any[]):AsyncGenerator;readonly length:number;readonly name:string;readonly prototype:AsyncGenerator;}interface AsyncGeneratorFunctionConstructor{new(...args:string[]):AsyncGeneratorFunction;(...args:string[]):AsyncGeneratorFunction;readonly length:number;readonly name:string;readonly prototype:AsyncGeneratorFunction;}"
};

export default fileData;