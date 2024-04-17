import { useCallback, useEffect } from "react";

export function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  const memoizedHandler = useCallback(handler, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        // nothing to do when clicked inside
        return;
      }

      memoizedHandler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, false);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener, false);
    };
  }, [memoizedHandler, ref]);
}
