import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export class UrlSaver {
  getUrlFiles(): Record<string, string> {
    if (document.location.hash.startsWith("#files/")) {
      try {
        const code = document.location.hash.replace("#files/", "").trim();
        const parsed = JSON.parse(decompressFromEncodedURIComponent(code) || "{}"); // null on error

        // keep only string-valued entries; ignore anything malformed in the hash
        if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
          const files: Record<string, string> = {};
          for (const key of Object.keys(parsed)) {
            if (typeof parsed[key] === "string") {
              files[key] = parsed[key];
            }
          }
          if (Object.keys(files).length !== 0) {
            return files;
          }
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
    const entries = Object.entries(files);
    // a single empty file is the default/empty state — keep the URL clean (no hash)
    const isEmpty = entries.length === 0 || (entries.length === 1 && entries[0][1] === "");
    if (isEmpty) {
      updateLocationHash("");
    } else {
      updateLocationHash(`files/${compressToEncodedURIComponent(JSON.stringify(files))}`);
    }

    function updateLocationHash(locationHash: string) {
      history.replaceState(undefined, "", `#${locationHash}`);
    }
  }
}
