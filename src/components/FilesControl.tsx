import type React from "react";

export function FilesControl(
  props: { files: Record<string, string>; currentFile: string; onChange: (file: string | undefined) => void },
): React.ReactElement {
  const fileNames = Object.keys(props.files);
  return (
    <div id="filesControl">
      <select value={props.currentFile} onChange={onChangeFile}>
        {/* keep the leading slash in the value (so imports resolve) but not in the display */}
        {fileNames.map((f) => <option key={f} value={f}>{f.replace(/^\//, "")}</option>)}
      </select>
      <button onClick={onNewFile} type="button">New File</button>
      <button onClick={onDeleteFile} type="button" disabled={fileNames.length <= 1}>Delete Current File</button>
    </div>
  );

  function onNewFile() {
    let name = prompt("Insert name");
    if (!name) return;

    // Make sure the file is in the root directory so imports between files work
    if (!name.startsWith("/")) {
      name = "/" + name;
    }

    // The file also ought to have an extension in all cases
    if (!name.includes(".")) {
      name += ".ts";
    }

    props.onChange(name);
  }

  function onDeleteFile() {
    props.onChange(undefined);
  }

  function onChangeFile(event: React.ChangeEvent<HTMLSelectElement>) {
    props.onChange(event.target.value);
  }
}
