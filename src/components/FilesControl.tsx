import type React from "react";

export function FilesControl(
  props: { files: Record<string, string>; currentFile: string; onChange: (file: string | undefined) => void },
): React.ReactElement {
  return (
    <div id="filesControl">
      <select value={props.currentFile} onChange={onChangeFile}>
        {Object.keys(props.files).map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <button onClick={onNewFile} type="button">New File</button>
      <button onClick={onDeleteFile} type="button">Delete Current File</button>
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
