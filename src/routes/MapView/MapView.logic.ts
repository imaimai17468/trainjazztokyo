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

export function createMap(options: MapOptions): maplibregl.Map {
  const map = new maplibregl.Map({
    container: options.container,
    style: options.style,
    center: options.center,
    zoom: options.zoom,
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  return map;
}

export function changeMapStyle(map: maplibregl.Map | undefined, style: string) {
  map?.setStyle(style);
}

export function destroyMap(map: maplibregl.Map | undefined) {
  map?.remove();
}
