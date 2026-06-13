import { createSignal, createEffect } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { useTheme } from "~/ThemeToggle/ThemeToggle.logic";
import { MAP_STYLES } from "./MapView.logic";
import { initSound } from "./MapView.sound";

const MapViewPresenter = clientOnly(() => import("./MapView"));

const TOKYO_CENTER: [number, number] = [139.7671, 35.6812];
const DEFAULT_ZOOM = 12;

type Props = {
  introOpen: boolean;
  onCloseIntro: () => void;
};

export default function MapViewContainer(props: Props) {
  const theme = useTheme();
  const [railwayOnly, setRailwayOnly] = createSignal(true);

  createEffect(() => {
    if (!props.introOpen) {
      initSound();
    }
  });

  return (
    <MapViewPresenter
      center={TOKYO_CENTER}
      zoom={DEFAULT_ZOOM}
      style={MAP_STYLES[theme()]}
      railwayOnly={railwayOnly()}
      onToggleRailwayOnly={() => setRailwayOnly((v) => !v)}
      introOpen={props.introOpen}
      onCloseIntro={props.onCloseIntro}
    />
  );
}
