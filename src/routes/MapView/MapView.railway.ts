import type maplibregl from "maplibre-gl";
import railwayData from "./tokyo-railway.json";
import { RAILWAY_COLOR, LINE_COLORS } from "./MapView.lines";
import type { TrainPosition } from "./entity/train";

export function addRailwayLayers(map: maplibregl.Map) {
  if (map.getSource("railway-lines")) return;

  map.addSource("railway-lines", {
    type: "geojson",
    data: railwayData.lines as GeoJSON.FeatureCollection,
  });

  map.addSource("railway-trains", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.addSource("railway-pulse", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.addLayer({
    id: "railway-lines",
    type: "line",
    source: "railway-lines",
    paint: {
      "line-color": RAILWAY_COLOR,
      "line-width": 1,
      "line-opacity": 0.4,
    },
  });

  map.addLayer({
    id: "railway-trains",
    type: "circle",
    source: "railway-trains",
    paint: {
      "circle-color": RAILWAY_COLOR,
      "circle-radius": 2.5,
      "circle-opacity": 0.9,
      "circle-stroke-width": 0,
    },
  });

  map.addLayer({
    id: "railway-pulse",
    type: "circle",
    source: "railway-pulse",
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": 3,
      "circle-opacity": ["get", "opacity"],
      "circle-stroke-width": 0,
    },
  });

  map.addLayer({
    id: "railway-pulse-glow",
    type: "circle",
    source: "railway-pulse",
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": ["get", "radius"],
      "circle-opacity": ["*", ["get", "opacity"], 0.3],
      "circle-stroke-width": 0,
    },
  });
}

export function updateTrainPositions(map: maplibregl.Map, positions: TrainPosition[]) {
  const source = map.getSource("railway-trains") as maplibregl.GeoJSONSource | undefined;
  if (!source) return;

  const features = positions.map((p) => ({
    type: "Feature" as const,
    properties: { color: p.color, line: p.line },
    geometry: { type: "Point" as const, coordinates: p.coordinates },
  }));

  source.setData({ type: "FeatureCollection", features });
}

type PulseEntry = {
  color: string;
  coordinates: [number, number];
  startTime: number;
  line: string;
};

const MAX_PULSES = 200;
const PULSE_DURATION = 800;
let activePulses: PulseEntry[] = [];
let animating = false;
let pulseMap: maplibregl.Map | undefined;
let highlightedLines: Set<string> | null = null;

export function resetPulseState() {
  activePulses = [];
  animating = false;
  pulseMap = undefined;
  highlightedLines = null;
}

export function triggerPulse(map: maplibregl.Map, position: TrainPosition) {
  if (!map.getSource("railway-pulse")) return;
  pulseMap = map;

  activePulses.push({
    color: position.color,
    coordinates: position.coordinates,
    startTime: performance.now(),
    line: position.line,
  });

  if (activePulses.length > MAX_PULSES) {
    activePulses = activePulses.slice(-MAX_PULSES);
  }

  if (!animating) {
    animating = true;
    requestAnimationFrame(animatePulses);
  }
}

function animatePulses() {
  const source = pulseMap?.getSource("railway-pulse") as maplibregl.GeoJSONSource | undefined;
  if (!source) {
    animating = false;
    return;
  }

  const now = performance.now();

  activePulses = activePulses.filter((p) => now - p.startTime <= PULSE_DURATION);

  if (activePulses.length === 0) {
    source.setData({ type: "FeatureCollection", features: [] });
    animating = false;
    return;
  }

  const visiblePulses = highlightedLines
    ? activePulses.filter((p) => highlightedLines!.has(p.line))
    : activePulses;

  const features = visiblePulses.map((p) => {
    const progress = (now - p.startTime) / PULSE_DURATION;
    const opacity = 1 - progress;
    const radius = 3 + progress * 15;
    return {
      type: "Feature" as const,
      properties: { color: p.color, opacity, radius },
      geometry: { type: "Point" as const, coordinates: p.coordinates },
    };
  });

  source.setData({ type: "FeatureCollection", features });
  requestAnimationFrame(animatePulses);
}

export function highlightLines(map: maplibregl.Map, lineNames: string[] | null) {
  highlightedLines = lineNames ? new Set(lineNames) : null;

  if (!lineNames) {
    map.setPaintProperty("railway-lines", "line-color", RAILWAY_COLOR);
    map.setPaintProperty("railway-lines", "line-width", 1);
    map.setPaintProperty("railway-lines", "line-opacity", 0.4);
    map.setPaintProperty("railway-trains", "circle-color", RAILWAY_COLOR);
    map.setPaintProperty("railway-trains", "circle-opacity", 0.9);
    return;
  }

  const DIM_LINE = 0.1;

  map.setPaintProperty("railway-lines", "line-color", [
    "match",
    ["get", "line"],
    ...lineNames.flatMap((n) => [n, LINE_COLORS[n] ?? RAILWAY_COLOR]),
    RAILWAY_COLOR,
  ]);
  map.setPaintProperty("railway-lines", "line-width", [
    "match",
    ["get", "line"],
    ...lineNames.flatMap((n) => [n, 2.5]),
    0.5,
  ]);
  map.setPaintProperty("railway-lines", "line-opacity", [
    "match",
    ["get", "line"],
    ...lineNames.flatMap((n) => [n, 1]),
    DIM_LINE,
  ]);
  map.setPaintProperty("railway-trains", "circle-opacity", 0);
}
