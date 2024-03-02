const fileData = {
    fileName: `/lib.es2019.array.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\ntype FlatArray<Arr,Depth extends number>={\"done\":Arr,\"recur\":Arr extends ReadonlyArray<infer InnerArr>?FlatArray<InnerArr,[-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20][Depth]>:Arr}[Depth extends-1?\"done\":\"recur\"];interface ReadonlyArray<T>{flatMap<U,This=undefined>(callback:(this:This,value:T,index:number,array:T[])=>U|ReadonlyArray<U>,thisArg?:This):U[]\nflat<A,D extends number=1>(this:A,depth?:D):FlatArray<A,D>[]}interface Array<T>{flatMap<U,This=undefined>(callback:(this:This,value:T,index:number,array:T[])=>U|ReadonlyArray<U>,thisArg?:This):U[]\nflat<A,D extends number=1>(this:A,depth?:D):FlatArray<A,D>[]}"
};

export default fileData;