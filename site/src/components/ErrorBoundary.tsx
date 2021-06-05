import React from "react";

export interface ErrorBoundaryProps {
    /** Some value that when changed from the previous value will reset the error boundary. */
    getResetHash?: () => string;
}

export interface ErrorBoundaryState {
    hasError: boolean;
    error?: any;
    errorInfo?: any;
}

/**
 * From: https://reactjs.org/docs/error-boundaries.html
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private lastResetHash: string | undefined;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error: any, errorInfo: any) {
        this.setState({ hasError: true, error, errorInfo });
        console.error(error);
        if (this.props.getResetHash != null)
            this.lastResetHash = this.props.getResetHash();
    }

    render() {
        if (this.getHasError()) {
            return (
                <div>
                    <h2>Something went wrong</h2>
                    <div style={{ whiteSpace: "pre-wrap" }}>
                        <div>{this.state.error && this.state.error.toString()}</div>
                        <div>{this.state.errorInfo.componentStack}</div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }

    private getHasError() {
        if (!this.state.hasError)
            return false;

        if (this.hasHashChanged()) {
            this.lastResetHash = undefined;
            this.setState({
                hasError: false,
                error: undefined,
            });
            return false;
        }

        return true;
    }

    private hasHashChanged() {
        if (this.props.getResetHash == null)
            return false;

        const currentResetHash = this.props.getResetHash();
        return currentResetHash !== this.lastResetHash;
    }
}
