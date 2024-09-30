import { BeatLoader } from "react-spinners";

export function Spinner() {
  return (
    <div
      className={"verticallyCenter horizontallyCenter fillHeight"}
      style={{ backgroundColor: "var(--vscode-background)" }}
    >
      <BeatLoader color={"var(--spinner-foreground)"} loading={true} size={25} />
    </div>
  );
}
