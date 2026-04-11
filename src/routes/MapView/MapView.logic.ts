import maplibregl from "maplibre-gl";

export type MapOptions = {
  container: HTMLDivElement;
  center: [number, number];
  zoom: number;
  style: string;
};

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

export function destroyMap(map: maplibregl.Map | undefined) {
  map?.remove();
}
