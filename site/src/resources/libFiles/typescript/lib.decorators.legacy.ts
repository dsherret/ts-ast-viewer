const fileData = {
    fileName: `/lib.decorators.legacy.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\ndeclare type ClassDecorator=<TFunction extends Function>(target:TFunction)=>TFunction|void;declare type PropertyDecorator=(target:Object,propertyKey:string|symbol)=>void;declare type MethodDecorator=<T>(target:Object,propertyKey:string|symbol,descriptor:TypedPropertyDescriptor<T>)=>TypedPropertyDescriptor<T>|void;declare type ParameterDecorator=(target:Object,propertyKey:string|symbol,parameterIndex:number)=>void;"
};

export default fileData;