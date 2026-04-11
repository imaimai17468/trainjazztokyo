import { clientOnly } from "@solidjs/start";
import { useTheme } from "~/ThemeToggle/ThemeToggle.logic";
import { MAP_STYLES } from "./MapView.logic";

const MapViewPresenter = clientOnly(() => import("./MapView"));

const TOKYO_CENTER: [number, number] = [139.7671, 35.6812];
const DEFAULT_ZOOM = 12;

export default function MapViewContainer() {
  const theme = useTheme();

  return <MapViewPresenter center={TOKYO_CENTER} zoom={DEFAULT_ZOOM} style={MAP_STYLES[theme()]} />;
}
