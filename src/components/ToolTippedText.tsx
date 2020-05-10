import React from "react";

export interface ToolTippedTextProps {
    text: string;
}

// adapted from https://codesandbox.io/s/XopkqJ5oV
export class ToolTippedText extends React.Component<ToolTippedTextProps, { isHovering: boolean }> {
    constructor(props: ToolTippedTextProps) {
        super(props);
        this.state = { isHovering: false };
        this.onMouseHoverChanged = this.onMouseHoverChanged.bind(this);
    }

    render() {
        return (
            <div className="toolTippedText" onMouseEnter={this.onMouseHoverChanged} onMouseLeave={this.onMouseHoverChanged}>
                <div className="titleText">{this.props.text}</div>
                {this.state.isHovering && this.getToolTip()}
            </div>
        );
    }

    private onMouseHoverChanged() {
        this.setState({ isHovering: !this.state.isHovering });
    }

    private getToolTip() {
        return <div className="tooltipText">{this.props.children}</div>;
    }
}
