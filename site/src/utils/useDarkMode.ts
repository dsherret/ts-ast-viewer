import { useEffect, useState } from "react";

const matchDarkMode = () => window.matchMedia("(prefers-color-scheme: dark)");

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(matchDarkMode().matches);

  useEffect(() => {
    const mediaQuery = matchDarkMode();

    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDarkMode;
}
