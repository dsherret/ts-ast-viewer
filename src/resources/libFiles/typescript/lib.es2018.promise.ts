export default {
    fileName: `/lib.es2018.promise.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\n/** * Represents the completion of an asynchronous operation */interface Promise<T>{/** * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The * resolved value cannot be modified from the callback. * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected). * @returns A Promise for the completion of the callback. */finally(onfinally?:(()=>void )|undefined|null):Promise<T>}`
};