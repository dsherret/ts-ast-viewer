import type React from "react";
import { useState } from "react";

export interface ToolTippedTextProps {
  text: string;
  children: React.ReactNode;
}

// adapted from https://codesandbox.io/s/XopkqJ5oV
export function ToolTippedText(props: ToolTippedTextProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="toolTippedText" onMouseEnter={onMouseHoverChanged} onMouseLeave={onMouseHoverChanged}>
      <div className="titleText">{props.text}</div>
      {isHovering && getToolTip()}
    </div>
  );

  function onMouseHoverChanged() {
    setIsHovering(!isHovering);
  }

  function getToolTip() {
    return <div className="tooltipText">{props.children}</div>;
  }
}
