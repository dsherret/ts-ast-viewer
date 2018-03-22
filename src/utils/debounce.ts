export function debounce(action: () => void, timeout: number) {
    let timeoutId: any | undefined; // needed to make this any for some reason
    const innerAction = () => {
        timeoutId = undefined;
        action();
    };

    return () => {
        if (timeoutId != null)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(innerAction, timeout);
    };
}