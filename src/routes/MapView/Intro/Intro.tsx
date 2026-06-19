import { AboutText } from "../About/About";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Intro({ open, onClose }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`fixed inset-0 z-60 flex items-center justify-center bg-white transition-[opacity,background-color] duration-700 ease-in-out dark:bg-gray-950 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="presentation"
        className="px-6 max-w-lg text-sm leading-relaxed text-gray-700 transition-colors duration-700 dark:text-gray-300"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <AboutText />
        <button
          type="button"
          onClick={onClose}
          className="mx-auto mt-8 block rounded-full border border-gray-300 px-6 py-2.5 text-sm tracking-widest text-gray-600 transition-colors duration-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          体験をはじめる
        </button>
      </div>
    </div>
  );
}
