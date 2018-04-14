import React from "react";

export interface ErrorBoundaryProps {
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
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error: any, errorInfo: any) {
        this.setState({ hasError: true, error, errorInfo });
        console.log(error);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div>
                <h2>Something went wrong</h2>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                    <div>{this.state.error && this.state.error.toString()}</div>
                    <div>{this.state.errorInfo.componentStack}</div>
                </div>
            </div>;
        }
        return this.props.children;
    }
}
