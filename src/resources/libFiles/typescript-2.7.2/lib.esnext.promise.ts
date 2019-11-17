export default {
    fileName: `/lib.esnext.promise.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\n/**\n * Represents the completion of an asynchronous operation\n */interface Promise<T>{/**\n * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The\n * resolved value cannot be modified from the callback.\n * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).\n * @returns A Promise for the completion of the callback.\n */finally(onfinally?:(()=>void )|undefined|null):Promise<T>}`
};