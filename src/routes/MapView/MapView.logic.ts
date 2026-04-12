import maplibregl from "maplibre-gl";

type MapOptions = {
  container: HTMLDivElement;
  center: [number, number];
  zoom: number;
  style: string;
};

export const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

// 初期表示: 路線の周囲に余白あり
const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [139.56, 35.53],
  [139.92, 35.82],
];

// スクロール制限: より広い範囲
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [139.2, 35.3],
  [140.2, 36.0],
];

const RAILWAY_LAYER_IDS = new Set([
  "railway-lines",
  "railway-trains",
  "railway-pulse",
  "railway-pulse-glow",
]);

const DIM = 0.35;

const TYPE_OPACITY: Record<string, string[]> = {
  background: ["background-opacity"],
  fill: ["fill-opacity"],
  line: ["line-opacity"],
  symbol: ["text-opacity", "icon-opacity"],
  raster: ["raster-opacity"],
  circle: ["circle-opacity"],
  "fill-extrusion": ["fill-extrusion-opacity"],
};

function dimLayout(layout: Record<string, unknown> = {}): Record<string, unknown> {
  const out = { ...layout };
  const size = out["text-size"];
  if (typeof size === "number") {
    out["text-size"] = size * 0.7;
  }
  return out;
}

function transformStyle(
  hide: boolean,
  _prev: maplibregl.StyleSpecification | undefined,
  next: maplibregl.StyleSpecification,
): maplibregl.StyleSpecification {
  return {
    ...next,
    layers: next.layers.map((layer) => {
      if (RAILWAY_LAYER_IDS.has(layer.id)) return layer;
      const keys = TYPE_OPACITY[layer.type];
      if (!keys) return layer;
      const paint = { ...(layer.paint as Record<string, unknown>) };
      for (const key of keys) {
        paint[key] = hide ? 0 : DIM;
      }
      const result = { ...layer, paint };
      if (!hide && layer.layout) {
        result.layout = dimLayout(layer.layout as Record<string, unknown>);
      }
      return result;
    }),
  };
}

export function prefetchStyles() {
  for (const url of Object.values(MAP_STYLES)) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = "fetch";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
}

export function createMap(options: MapOptions): maplibregl.Map {
  const map = new maplibregl.Map({
    container: options.container,
    style: options.style,
    center: options.center,
    zoom: options.zoom,
    maxBounds: MAX_BOUNDS,
    attributionControl: false,
    fadeDuration: 0,
    renderWorldCopies: false,
  });

  map.fitBounds(DEFAULT_BOUNDS, { padding: 20 });

  return map;
}

export function changeMapStyle(
  map: maplibregl.Map | undefined,
  style: string,
  hideBaseLayers: boolean,
) {
  map?.setStyle(style, {
    transformStyle: (prev, next) => transformStyle(hideBaseLayers, prev, next),
  });
}

export function setBaseLayersVisible(map: maplibregl.Map, visible: boolean) {
  const style = map.getStyle();
  for (const layer of style.layers) {
    if (RAILWAY_LAYER_IDS.has(layer.id)) continue;
    const keys = TYPE_OPACITY[layer.type];
    if (!keys) continue;
    for (const key of keys) {
      map.setPaintProperty(layer.id, key, visible ? DIM : 0);
    }
  }
}

export function destroyMap(map: maplibregl.Map | undefined) {
  map?.remove();
}
