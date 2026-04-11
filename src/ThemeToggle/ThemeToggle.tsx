import { Sun, Moon } from "lucide-solid";
import type { Theme } from "./ThemeToggle.logic";

type Props = {
  theme: Theme;
  onToggle: () => void;
};

export default function ThemeToggle(props: Props) {
  return (
    <button
      type="button"
      onClick={props.onToggle}
      class="fixed bottom-4 right-4 z-50 rounded-full bg-gray-200 p-1.5 text-gray-500 transition-colors duration-700 dark:bg-gray-800 dark:text-gray-400"
      aria-label={props.theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {props.theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
