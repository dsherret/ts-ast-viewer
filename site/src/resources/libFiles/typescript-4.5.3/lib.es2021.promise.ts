const fileData = {
    fileName: `/lib.es2021.promise.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ninterface AggregateError extends Error{errors:any[]}interface AggregateErrorConstructor{new(errors:Iterable<any>,message?:string):AggregateError;(errors:Iterable<any>,message?:string):AggregateError;readonly prototype:AggregateError;}declare var AggregateError:AggregateErrorConstructor;interface PromiseConstructor{any<T extends readonly unknown[]|[]>(values:T):Promise<Awaited<T[number]>>;any<T>(values:Iterable<T|PromiseLike<T>>):Promise<Awaited<T>>}`
};

export default fileData;