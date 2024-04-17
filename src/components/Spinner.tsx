import React from "react";
import { BeatLoader } from "react-spinners";

export function Spinner(props: { backgroundColor?: string }) {
  const { backgroundColor } = props;
  return (
    <div
      className={"verticallyCenter horizontallyCenter fillHeight"}
      style={{ backgroundColor: "var(--vscode-background)" }}
    >
      <BeatLoader color={"var(--spinner-foreground)"} loading={true} size={25} />
    </div>
  );
}
