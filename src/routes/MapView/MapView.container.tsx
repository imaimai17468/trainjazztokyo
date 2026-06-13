import { createSignal } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { useTheme } from "~/ThemeToggle/ThemeToggle.logic";

const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

const MapViewPresenter = clientOnly(() => import("./MapView"));

const TOKYO_CENTER: [number, number] = [139.7671, 35.6812];
const DEFAULT_ZOOM = 12;

export default function MapViewContainer() {
  const theme = useTheme();
  const [railwayOnly, setRailwayOnly] = createSignal(true);
  const [introOpen, setIntroOpen] = createSignal(true);

  return (
    <MapViewPresenter
      center={TOKYO_CENTER}
      zoom={DEFAULT_ZOOM}
      style={MAP_STYLES[theme()]}
      railwayOnly={railwayOnly()}
      onToggleRailwayOnly={() => setRailwayOnly((v) => !v)}
      introOpen={introOpen()}
      onCloseIntro={() => setIntroOpen(false)}
    />
  );
}
