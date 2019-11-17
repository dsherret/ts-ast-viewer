export default {
    fileName: `/lib.es2015.generator.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ninterface Generator extends Iterator<any>{}interface GeneratorFunction{new(...args:any[]):Generator;(...args:any[]):Generator;readonly length:number;readonly name:string;readonly prototype:Generator;}interface GeneratorFunctionConstructor{new(...args:string[]):GeneratorFunction;(...args:string[]):GeneratorFunction;readonly length:number;readonly name:string;readonly prototype:GeneratorFunction;}`
};