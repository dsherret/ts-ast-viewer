export function debounce<T>(action: (value: T) => void, timeout: number) {
    let timeoutId: any | undefined; // needed to make this any for some reason
    return (value: T) => {
        if (timeoutId != null)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            timeoutId = undefined;
            action(value);
        }, timeout);
    };
}
