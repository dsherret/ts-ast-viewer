import type React from "react";
import { useEffect, useRef, useState } from "react";

const middleButton = 1;
/** Deleting a file with more text than this asks first, so a stray click can't lose real work. */
const confirmDeleteTextLength = 100;

export interface FilesControlProps {
  files: Record<string, string>;
  currentFile: string;
  onSelect: (file: string) => void;
  onAdd: (file: string) => void;
  onRename: (file: string, newFile: string) => void;
  onDelete: (file: string) => void;
}

export function FilesControl(props: FilesControlProps): React.ReactElement {
  // the file whose tab is currently a text box
  const [renamingFile, setRenamingFile] = useState<string>();
  const fileNames = Object.keys(props.files);
  const canDelete = fileNames.length > 1;

  return (
    <div id="filesControl">
      <div className="fileTabs" role="tablist">
        {fileNames.map((file) => getTab(file))}
      </div>
      <button className="newFile" onClick={onNewFile} type="button" title="New file">+</button>
    </div>
  );

  function getTab(file: string) {
    if (file === renamingFile) {
      return <FileNameInput key={file} name={getDisplayName(file)} onDone={(name) => finishRename(file, name)} />;
    }

    const isCurrent = file === props.currentFile;
    return (
      <div
        key={file}
        className={isCurrent ? "fileTab active" : "fileTab"}
        role="tab"
        aria-selected={isCurrent}
        title={`${file} (double click to rename)`}
        onClick={() => props.onSelect(file)}
        onDoubleClick={() => setRenamingFile(file)}
        onMouseDown={(event) => {
          // keep the middle button from starting an autoscroll on the tab strip
          if (event.button === middleButton) {
            event.preventDefault();
          }
        }}
        onAuxClick={(event) => {
          if (event.button === middleButton && canDelete) {
            deleteFile(file);
          }
        }}
      >
        {/* keep the leading slash in the value (so imports resolve) but not in the display */}
        <span className="fileName">{getDisplayName(file)}</span>
        {canDelete && (
          <button
            className="deleteFile"
            type="button"
            title={`Delete ${file}`}
            onClick={(event) => {
              event.stopPropagation(); // don't also select the tab being deleted
              deleteFile(file);
            }}
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  function deleteFile(file: string) {
    const text = props.files[file] ?? "";
    if (text.trim().length > confirmDeleteTextLength && !confirm(`Delete ${file}?`)) {
      return;
    }
    props.onDelete(file);
  }

  function onNewFile() {
    const file = getUntitledFileName(props.files);
    props.onAdd(file);
    // drop straight into renaming so the placeholder name can be typed over
    setRenamingFile(file);
  }

  function finishRename(file: string, name: string | undefined) {
    setRenamingFile(undefined);
    if (name == null) {
      return; // cancelled
    }
    const newFile = toFilePath(name);
    if (newFile != null && newFile !== file) {
      props.onRename(file, newFile);
    }
  }
}

/** The tab's label while it's being renamed, with the name (but not the extension) selected. */
function FileNameInput(props: { name: string; onDone: (name: string | undefined) => void }) {
  const [value, setValue] = useState(props.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input == null) {
      return;
    }
    input.focus();
    // select just the name so typing replaces it and keeps the extension
    const extensionIndex = props.name.lastIndexOf(".");
    input.setSelectionRange(0, extensionIndex > 0 ? extensionIndex : props.name.length);
  }, []);

  return (
    <div className="fileTab active renaming">
      <input
        ref={inputRef}
        className="fileNameInput"
        value={value}
        size={Math.max(value.length, 8)}
        spellCheck={false}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => props.onDone(value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            props.onDone(value);
          } else if (event.key === "Escape") {
            props.onDone(undefined);
          }
        }}
      />
    </div>
  );
}

function getUntitledFileName(files: Record<string, string>) {
  for (let i = 1;; i++) {
    const file = i === 1 ? "/untitled.ts" : `/untitled${i}.ts`;
    if (files[file] == null) {
      return file;
    }
  }
}

function getDisplayName(file: string) {
  return file.replace(/^\//, "");
}

/** Normalize a typed name into a file path, or undefined when it isn't usable. */
function toFilePath(name: string) {
  name = name.trim();
  if (name.length === 0) {
    return undefined;
  }
  // keep files in the root directory so imports between them work
  if (!name.startsWith("/")) {
    name = "/" + name;
  }
  // the file also ought to have an extension in all cases
  if (!name.includes(".")) {
    name += ".ts";
  }
  return name;
}
