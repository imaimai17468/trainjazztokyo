import { useEffect } from "react";
import { useTheme, applyTheme, toggleTheme } from "./ThemeToggle.logic";
import ThemeToggle from "./ThemeToggle";

export default function ThemeToggleContainer() {
  const theme = useTheme();

  useEffect(() => {
    applyTheme(theme);
  }, []);

  return <ThemeToggle theme={theme} onToggle={toggleTheme} />;
}
