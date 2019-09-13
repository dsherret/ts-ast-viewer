import { decompressFromEncodedURIComponent, compressToEncodedURIComponent } from "lz-string";

export class UrlSaver {
    getUrlCode() {
        if (document.location.hash && document.location.hash.startsWith("#code")) {
            try {
                const code = document.location.hash.replace("#code/", "").trim();
                return decompressFromEncodedURIComponent(code) || ""; // will be null on error
            } catch (err) {
                console.error(err);
            }
        }

        return "";
    }

    updateUrl(code: string) {
        if (code.length === 0)
            updateLocationHash("");
        else
            updateLocationHash(`code/${compressToEncodedURIComponent(code)}`);

        function updateLocationHash(locationHash: string) {
            window.history.replaceState(undefined, "", `#${locationHash}`);
        }
    }
}
