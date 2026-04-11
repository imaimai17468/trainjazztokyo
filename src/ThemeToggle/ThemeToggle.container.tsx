import { onMount } from "solid-js";
import { useTheme, applyTheme, toggleTheme } from "./ThemeToggle.logic";
import ThemeToggle from "./ThemeToggle";

export default function ThemeToggleContainer() {
  const theme = useTheme();

  onMount(() => {
    applyTheme(theme());
  });

  return <ThemeToggle theme={theme()} onToggle={toggleTheme} />;
}
