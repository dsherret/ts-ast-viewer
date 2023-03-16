const fileData = {
    fileName: `/lib.es2015.generator.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\n/// <reference lib=\"es2015.iterable\" />\ninterface Generator<T=unknown,TReturn=any,TNext=unknown>extends Iterator<T,TReturn,TNext>{next(...args:[]|[TNext]):IteratorResult<T,TReturn>;return(value:TReturn):IteratorResult<T,TReturn>;throw(e:any):IteratorResult<T,TReturn>;[Symbol.iterator]():Generator<T,TReturn,TNext>;}interface GeneratorFunction{new(...args:any[]):Generator;(...args:any[]):Generator;readonly length:number;readonly name:string;readonly prototype:Generator;}interface GeneratorFunctionConstructor{new(...args:string[]):GeneratorFunction;(...args:string[]):GeneratorFunction;readonly length:number;readonly name:string;readonly prototype:GeneratorFunction;}"
};

export default fileData;