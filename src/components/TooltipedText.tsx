import React from "react";

export interface TooltipedTextProps {
    text: string;
}

// adapted from https://codesandbox.io/s/XopkqJ5oV
export class TooltipedText extends React.Component<TooltipedTextProps, { isHovering: boolean }> {
    constructor(props: TooltipedTextProps) {
        super(props);
        this.state = { isHovering: false };
        this.onMouseHoverChanged = this.onMouseHoverChanged.bind(this);
    }

    render() {
        return (
            <div className="tooltipedText" onMouseEnter={this.onMouseHoverChanged} onMouseLeave={this.onMouseHoverChanged}>
                <div className="titleText">{this.props.text}</div>
                {this.state.isHovering && this.getToolTip()}
            </div>);
    }

    private onMouseHoverChanged() {
        this.setState({ isHovering: !this.state.isHovering });
    }

    private getToolTip() {
        return <div className="tooltipText">
                {this.props.children}
            </div>;
    }
}