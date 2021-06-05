import React from "react";

export function ExternalLink(props: { text: string; url: string }): React.ReactElement {
    return <a href={props.url} target="_blank" rel="noopener noreferrer">{props.text}</a>;
}
