export default {
    fileName: `/lib.es2017.object.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ninterface ObjectConstructor{values<T>(o:{[s:string]:T}|{[n:number]:T}):T[];values(o:any):any[];entries<T>(o:{[s:string]:T}|{[n:number]:T}):[string,T][];entries(o:any):[string,any][];getOwnPropertyDescriptors<T>(o:T):{[P in keyof T]:TypedPropertyDescriptor<T[P]>}&{[x:string]:PropertyDescriptor};}`
};