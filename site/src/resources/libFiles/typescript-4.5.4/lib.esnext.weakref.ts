const fileData = {
    fileName: `/lib.esnext.weakref.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ninterface WeakRef<T extends object>{readonly[Symbol.toStringTag]:"WeakRef";deref():T|undefined;}interface WeakRefConstructor{readonly prototype:WeakRef<any>;new<T extends object>(target?:T):WeakRef<T>;}declare var WeakRef:WeakRefConstructor;interface FinalizationRegistry{readonly[Symbol.toStringTag]:"FinalizationRegistry";register(target:object,heldValue:any,unregisterToken?:object):void;unregister(unregisterToken:object):void;}interface FinalizationRegistryConstructor{readonly prototype:FinalizationRegistry;new(cleanupCallback:(heldValue:any)=>void):FinalizationRegistry;}declare var FinalizationRegistry:FinalizationRegistryConstructor;`
};

export default fileData;