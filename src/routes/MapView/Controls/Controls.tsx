import { createSignal } from "solid-js";
import { Globe, Volume2, VolumeOff } from "lucide-solid";
import { setMuted } from "../MapView.sound";

type Props = {
  railwayOnly: boolean;
  onToggleRailwayOnly: () => void;
};

export default function Controls(props: Props) {
  const [soundOn, setSoundOn] = createSignal(true);

  const toggleSound = () => {
    const next = !soundOn();
    setSoundOn(next);
    setMuted(!next);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleSound}
        class="fixed bottom-4 right-14 z-50 rounded-full p-1.5 transition-colors duration-700"
        classList={{
          "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400": !soundOn(),
          "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900": soundOn(),
        }}
        aria-label={soundOn() ? "音を消す" : "音を出す"}
      >
        {soundOn() ? <Volume2 size={16} /> : <VolumeOff size={16} />}
      </button>
      <button
        type="button"
        onClick={props.onToggleRailwayOnly}
        class="fixed bottom-4 right-24 z-50 rounded-full p-1.5 transition-colors duration-700"
        classList={{
          "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400": props.railwayOnly,
          "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900": !props.railwayOnly,
        }}
        aria-label={props.railwayOnly ? "地図を表示" : "線路のみ表示"}
      >
        <Globe size={16} />
      </button>
    </>
  );
}
