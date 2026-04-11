import { clientOnly } from "@solidjs/start";

const MapViewPresenter = clientOnly(() => import("./MapView"));

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const TOKYO_CENTER: [number, number] = [139.7671, 35.6812];
const DEFAULT_ZOOM = 12;

export default function MapViewContainer() {
  return <MapViewPresenter center={TOKYO_CENTER} zoom={DEFAULT_ZOOM} style={MAP_STYLE} />;
}
