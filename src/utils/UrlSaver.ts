import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export class UrlSaver {
  getUrlFiles(): Record<string, string> {
    if (document.location.hash && document.location.hash.startsWith("#files")) {
      try {
        const code = document.location.hash.replace("#files/", "").trim();
        const files = JSON.parse(decompressFromEncodedURIComponent(code) || "{}"); // will be null on error

        for (const key in Object.keys(files)) {
          if (typeof files[key] !== "string") {
            delete files[key];
          }
        }

        if (Object.keys(files).length !== 0) {
          return files;
        }
      } catch (err) {
        console.error(err);
      }
    }

    return { "/main.ts": this.getUrlCode() };
  }

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

  updateUrl(files: Record<string, string>) {
    const serializedFiles = JSON.stringify(files);
    if (serializedFiles.length === 2) {
      updateLocationHash("");
    } else {
      updateLocationHash(`files/${compressToEncodedURIComponent(serializedFiles)}`);
    }

    function updateLocationHash(locationHash: string) {
      history.replaceState(undefined, "", `#${locationHash}`);
    }
  }
}
