import type maplibregl from "maplibre-gl";
import railwayData from "./tokyo-railway.json";
import { RAILWAY_COLOR, LINE_COLORS } from "./MapView.lines";
import type { TrainPosition } from "./entity/train";
import type { TrainGroup } from "./gateway/groupTrains";
import { getLineGeometry, coordsBetweenFractions, coordAtFraction } from "./gateway/convertTrains";
import { getMorphProgress, morphTrainCoordinate } from "./MapView.morph";

export function addRailwayLayers(map: maplibregl.Map) {
  if (map.getSource("railway-lines")) return;

  map.addSource("railway-lines", {
    type: "geojson",
    data: railwayData.lines as GeoJSON.FeatureCollection,
  });

  map.addSource("railway-group-segments", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
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
    id: "railway-group-segments",
    type: "line",
    source: "railway-group-segments",
    paint: {
      "line-color": ["get", "color"],
      "line-width": 2,
      "line-opacity": 0.85,
    },
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
  });

  map.addLayer({
    id: "railway-trains",
    type: "circle",
    source: "railway-trains",
    paint: {
      "circle-color": ["get", "color"],
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

const INACTIVE_COLOR = "#d1d5db";

let currentScanPos = 0;

export function setScanPosition(pos: number) {
  currentScanPos = pos;
}

export function getGroupCoords(group: TrainGroup): [number, number] {
  const geo = getLineGeometry(group.line);
  if (!geo) return [139.7671, 35.6812];
  const midProgress = (group.startProgress + group.endProgress) / 2;
  return coordAtFraction(geo, midProgress);
}

export function updateTrainGroups(
  map: maplibregl.Map,
  groups: TrainGroup[],
  positions: TrainPosition[],
) {
  const mp = getMorphProgress();

  const trainSource = map.getSource("railway-trains") as maplibregl.GeoJSONSource | undefined;
  if (trainSource) {
    const pointFeatures = positions.map((p) => {
      const active = groups.some(
        (g) =>
          g.line === p.line &&
          p.progress >= g.startProgress &&
          p.progress <= g.endProgress &&
          currentScanPos >= g.startProgress &&
          currentScanPos <= g.endProgress + 0.03,
      );
      const color = active ? p.color : INACTIVE_COLOR;
      const coords =
        mp > 0 ? morphTrainCoordinate(p.line, p.coordinates, p.progress) : p.coordinates;
      return {
        type: "Feature" as const,
        properties: { color, line: p.line },
        geometry: { type: "Point" as const, coordinates: coords },
      };
    });
    trainSource.setData({ type: "FeatureCollection", features: pointFeatures });
  }

  const segSource = map.getSource("railway-group-segments") as maplibregl.GeoJSONSource | undefined;
  if (segSource) {
    const segFeatures: GeoJSON.Feature[] = [];

    for (const group of groups) {
      if (group.trainCount < 2) continue;

      const geo = getLineGeometry(group.line);
      if (!geo) continue;

      const active =
        currentScanPos >= group.startProgress && currentScanPos <= group.endProgress + 0.03;
      const color = active ? group.color : INACTIVE_COLOR;

      const rawCoords = coordsBetweenFractions(geo, group.startProgress, group.endProgress);

      const coords =
        mp > 0
          ? rawCoords.map((c, i) => {
              const frac =
                rawCoords.length > 1
                  ? group.startProgress +
                    (i / (rawCoords.length - 1)) * (group.endProgress - group.startProgress)
                  : group.startProgress;
              return morphTrainCoordinate(group.line, c, frac);
            })
          : rawCoords;

      segFeatures.push({
        type: "Feature",
        properties: { color, line: group.line },
        geometry: { type: "LineString", coordinates: coords },
      });
    }

    segSource.setData({ type: "FeatureCollection", features: segFeatures });
  }
}

export function updateTrainPositions(map: maplibregl.Map, positions: TrainPosition[]) {
  const source = map.getSource("railway-trains") as maplibregl.GeoJSONSource | undefined;
  if (!source) return;

  const mp = getMorphProgress();
  const features = positions.map((p) => {
    const coords = mp > 0 ? morphTrainCoordinate(p.line, p.coordinates, p.progress) : p.coordinates;
    return {
      type: "Feature" as const,
      properties: { color: p.color, line: p.line },
      geometry: { type: "Point" as const, coordinates: coords },
    };
  });

  source.setData({ type: "FeatureCollection", features });
}

type PulseEntry = {
  color: string;
  coordinates: [number, number];
  startTime: number;
  line: string;
  trainProgress: number;
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

export function triggerGroupPulse(map: maplibregl.Map, group: TrainGroup) {
  if (!map.getSource("railway-pulse")) return;
  pulseMap = map;

  const geo = getLineGeometry(group.line);
  if (!geo) return;

  const midProgress = (group.startProgress + group.endProgress) / 2;
  const coord = coordAtFraction(geo, midProgress);

  activePulses.push({
    color: group.color,
    coordinates: coord,
    startTime: performance.now(),
    line: group.line,
    trainProgress: midProgress,
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

  const mp = getMorphProgress();

  const features = visiblePulses.map((p) => {
    const progress = (now - p.startTime) / PULSE_DURATION;
    const opacity = 1 - progress;
    const radius = 3 + progress * 15;
    const coords =
      mp > 0 ? morphTrainCoordinate(p.line, p.coordinates, p.trainProgress) : p.coordinates;
    return {
      type: "Feature" as const,
      properties: { color: p.color, opacity, radius },
      geometry: { type: "Point" as const, coordinates: coords },
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
    map.setPaintProperty("railway-trains", "circle-color", ["get", "color"]);
    map.setPaintProperty("railway-trains", "circle-opacity", 0.9);
    map.setPaintProperty("railway-group-segments", "line-color", ["get", "color"]);
    map.setPaintProperty("railway-group-segments", "line-opacity", 0.7);
    return;
  }

  const DIM_LINE = 0.1;
  const DIM_TRAIN = 0.3;

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
  map.setPaintProperty("railway-trains", "circle-color", [
    "match",
    ["get", "line"],
    ...lineNames.flatMap((n) => [n, LINE_COLORS[n] ?? RAILWAY_COLOR]),
    RAILWAY_COLOR,
  ]);
  map.setPaintProperty("railway-trains", "circle-opacity", [
    "match",
    ["get", "line"],
    ...lineNames.flatMap((n) => [n, 1]),
    DIM_TRAIN,
  ]);
  map.setPaintProperty("railway-group-segments", "line-color", [
    "match",
    ["get", "line"],
    ...lineNames.flatMap((n) => [n, LINE_COLORS[n] ?? RAILWAY_COLOR]),
    RAILWAY_COLOR,
  ]);
  map.setPaintProperty("railway-group-segments", "line-opacity", [
    "match",
    ["get", "line"],
    ...lineNames.flatMap((n) => [n, 0.7]),
    DIM_TRAIN,
  ]);
}
