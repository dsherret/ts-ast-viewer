export default {
    fileName: `/lib.es2020.promise.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ninterface PromiseFulfilledResult<T>{status:"fulfilled";value:T;}interface PromiseRejectedResult{status:"rejected";reason:any;}type PromiseSettledResult<T>=PromiseFulfilledResult<T>|PromiseRejectedResult;interface PromiseConstructor{allSettled<T extends readonly unknown[]|readonly[unknown]>(values:T):Promise<{-readonly[P in keyof T]:PromiseSettledResult<T[P]extends PromiseLike<infer U>?U:T[P]>}>;allSettled<T>(values:Iterable<T>):Promise<PromiseSettledResult<T extends PromiseLike<infer U>?U:T>[]>;}`
};