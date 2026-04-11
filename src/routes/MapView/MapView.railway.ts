import type maplibregl from "maplibre-gl";
import railwayData from "./tokyo-railway.json";
import type { DepartureEvent } from "./MapView.timetable";

const RAILWAY_COLOR = "#9ca3af";

export type StationInfo = {
  name: string;
  lines: string[];
  coordinates: [number, number];
};

export function getStations(): StationInfo[] {
  return railwayData.stations.features.map((f) => ({
    name: f.properties.name as string,
    lines: f.properties.lines as string[],
    coordinates: f.geometry.coordinates as [number, number],
  }));
}

export function addRailwayLayers(map: maplibregl.Map) {
  map.addSource("railway-lines", {
    type: "geojson",
    data: railwayData.lines as GeoJSON.FeatureCollection,
  });

  map.addSource("railway-stations", {
    type: "geojson",
    data: railwayData.stations as GeoJSON.FeatureCollection,
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
    },
  });

  map.addLayer({
    id: "railway-stations",
    type: "circle",
    source: "railway-stations",
    paint: {
      "circle-color": RAILWAY_COLOR,
      "circle-radius": 3,
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

type PulseEntry = {
  color: string;
  coordinates: [number, number];
  startTime: number;
};

const PULSE_DURATION = 800; // ms
const activePulses: PulseEntry[] = [];
let animating = false;

export function triggerDepartures(map: maplibregl.Map, departures: DepartureEvent[]) {
  const source = map.getSource("railway-pulse") as maplibregl.GeoJSONSource | undefined;
  if (!source) return;

  const now = performance.now();
  for (const d of departures) {
    activePulses.push({ color: d.color, coordinates: d.coordinates, startTime: now });
  }

  if (!animating) {
    animating = true;
    requestAnimationFrame(() => animatePulses(source));
  }
}

function animatePulses(source: maplibregl.GeoJSONSource) {
  const now = performance.now();

  // Remove expired pulses
  while (activePulses.length > 0 && now - activePulses[0].startTime > PULSE_DURATION) {
    activePulses.shift();
  }

  if (activePulses.length === 0) {
    source.setData({ type: "FeatureCollection", features: [] });
    animating = false;
    return;
  }

  const features = activePulses.map((p) => {
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
  requestAnimationFrame(() => animatePulses(source));
}

export function removeRailwayLayers(map: maplibregl.Map) {
  for (const id of ["railway-pulse-glow", "railway-pulse", "railway-stations", "railway-lines"]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  for (const id of ["railway-pulse", "railway-stations", "railway-lines"]) {
    if (map.getSource(id)) map.removeSource(id);
  }
}
