export default {
    fileName: `/lib.esnext.promise.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ninterface AggregateError extends Error{errors:any[]}interface AggregateErrorConstructor{new(errors:Iterable<any>,message?:string):AggregateError;(errors:Iterable<any>,message?:string):AggregateError;readonly prototype:AggregateError;}declare var AggregateError:AggregateErrorConstructor;interface PromiseConstructor{any<T>(values:(T|PromiseLike<T>)[]|Iterable<T|PromiseLike<T>>):Promise<T>}`
};