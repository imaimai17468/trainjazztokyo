import maplibregl from "maplibre-gl";

type MapOptions = {
  container: HTMLDivElement;
  center: [number, number];
  zoom: number;
  style: string;
  hideBaseLayers: boolean;
};

export const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

const TOKYO_BOUNDS: [[number, number], [number, number]] = [
  [139.56, 35.53],
  [139.92, 35.82],
];

const RAILWAY_LAYER_IDS = new Set([
  "railway-lines",
  "railway-stations",
  "railway-pulse",
  "railway-pulse-glow",
]);

function hideBaseLayersTransform(
  _prev: maplibregl.StyleSpecification | undefined,
  next: maplibregl.StyleSpecification,
): maplibregl.StyleSpecification {
  return {
    ...next,
    layers: next.layers.map((layer) =>
      RAILWAY_LAYER_IDS.has(layer.id)
        ? layer
        : { ...layer, layout: { ...layer.layout, visibility: "none" as const } },
    ),
  };
}

export function createMap(options: MapOptions): maplibregl.Map {
  const map = new maplibregl.Map({
    container: options.container,
    style: options.style,
    center: options.center,
    zoom: options.zoom,
    maxBounds: TOKYO_BOUNDS,
    attributionControl: false,
    transformStyle: options.hideBaseLayers ? hideBaseLayersTransform : undefined,
  });

  map.fitBounds(TOKYO_BOUNDS, { padding: 0 });

  return map;
}

export function changeMapStyle(
  map: maplibregl.Map | undefined,
  style: string,
  hideBaseLayers: boolean,
) {
  cachedBaseLayerIds = null;
  map?.setStyle(style, {
    transformStyle: hideBaseLayers ? hideBaseLayersTransform : undefined,
  });
}

let cachedBaseLayerIds: string[] | null = null;

export function setBaseLayersVisible(map: maplibregl.Map, visible: boolean) {
  const visibility = visible ? "visible" : "none";
  if (!cachedBaseLayerIds) {
    cachedBaseLayerIds = map
      .getStyle()
      .layers.filter((l) => !RAILWAY_LAYER_IDS.has(l.id))
      .map((l) => l.id);
  }
  for (const id of cachedBaseLayerIds) {
    map.setLayoutProperty(id, "visibility", visibility);
  }
}

export function destroyMap(map: maplibregl.Map | undefined) {
  map?.remove();
}
