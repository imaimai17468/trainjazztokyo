import maplibregl from "maplibre-gl";

export type MapOptions = {
  container: HTMLDivElement;
  center: [number, number];
  zoom: number;
  style: string;
};

export const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

export const TOKYO_BOUNDS: [[number, number], [number, number]] = [
  [139.5, 35.5],
  [140.05, 35.85],
];

export function createMap(options: MapOptions): maplibregl.Map {
  const map = new maplibregl.Map({
    container: options.container,
    style: options.style,
    center: options.center,
    zoom: options.zoom,
    maxBounds: TOKYO_BOUNDS,
    attributionControl: false,
  });

  return map;
}

export function changeMapStyle(map: maplibregl.Map | undefined, style: string) {
  map?.setStyle(style);
}

export function destroyMap(map: maplibregl.Map | undefined) {
  map?.remove();
}
