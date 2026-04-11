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
      class="fixed top-4 right-4 z-50 rounded-full bg-white p-2 text-gray-800 shadow-md dark:bg-gray-800 dark:text-white"
      aria-label={props.theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {props.theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
