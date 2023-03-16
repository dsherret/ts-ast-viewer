const fileData = {
    fileName: `/lib.es2015.promise.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\ninterface PromiseConstructor{readonly prototype:Promise<any>;new<T>(executor:(resolve:(value:T|PromiseLike<T>)=>void,reject:(reason?:any)=>void)=>void):Promise<T>;all<T extends readonly unknown[]|[]>(values:T):Promise<{-readonly[P in keyof T]:Awaited<T[P]>}>;race<T extends readonly unknown[]|[]>(values:T):Promise<Awaited<T[number]>>;reject<T=never>(reason?:any):Promise<T>;resolve():Promise<void>;resolve<T>(value:T):Promise<Awaited<T>>;resolve<T>(value:T|PromiseLike<T>):Promise<Awaited<T>>;}declare var Promise:PromiseConstructor;"
};

export default fileData;