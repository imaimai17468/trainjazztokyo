import type maplibregl from "maplibre-gl";
import railwayData from "./tokyo-railway.json";
import type { DepartureEvent } from "./MapView.timetable";

const RAILWAY_COLOR = "#9ca3af";

const LINE_COLOR_MAP: Record<string, string> = {
  山手線: "#9acd32",
  中央線快速: "#f15a22",
  "中央・総武緩行線": "#ffd400",
  京浜東北線: "#00b2e5",
  埼京線: "#00ac9b",
  湘南新宿ライン: "#e85298",
  上野東京ライン: "#f15a22",
  東京メトロ銀座線: "#f39700",
  東京メトロ丸ノ内線: "#e60012",
  東京メトロ日比谷線: "#9caeb7",
  東京メトロ東西線: "#00a7db",
  東京メトロ千代田線: "#00a650",
  東京メトロ有楽町線: "#c1a470",
  東京メトロ半蔵門線: "#8b76d0",
  東京メトロ南北線: "#00ada9",
  東京メトロ副都心線: "#9c5e31",
  都営浅草線: "#e85298",
  都営三田線: "#0079c2",
  都営新宿線: "#6cbb5a",
  都営大江戸線: "#b6007a",
  東急東横線: "#da0442",
  東急田園都市線: "#009944",
  小田急小田原線: "#1e90ff",
  京王線: "#dd0077",
};

type StationInfo = {
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
  if (map.getSource("railway-lines")) return;

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
      "line-opacity": 0.4,
    },
  });

  map.addLayer({
    id: "railway-stations",
    type: "circle",
    source: "railway-stations",
    paint: {
      "circle-color": RAILWAY_COLOR,
      "circle-radius": 1.5,
      "circle-opacity": 0.4,
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
  line: string;
};

const PULSE_DURATION = 800; // ms
const activePulses: PulseEntry[] = [];
let animating = false;
let pulseMap: maplibregl.Map | undefined;
let highlightedLines: Set<string> | null = null;

export function triggerDepartures(map: maplibregl.Map, departures: DepartureEvent[]) {
  if (!map.getSource("railway-pulse")) return;
  pulseMap = map;

  const now = performance.now();
  for (const d of departures) {
    activePulses.push({ color: d.color, coordinates: d.coordinates, startTime: now, line: d.line });
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

  while (activePulses.length > 0 && now - activePulses[0].startTime > PULSE_DURATION) {
    activePulses.shift();
  }

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
    map.setPaintProperty("railway-stations", "circle-opacity", 0.4);
    return;
  }

  const DIM_LINE = 0.1;

  map.setPaintProperty("railway-lines", "line-color", [
    "match",
    ["get", "line"],
    ...lineNames.flatMap((n) => [n, LINE_COLOR_MAP[n] ?? RAILWAY_COLOR]),
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
  map.setPaintProperty("railway-stations", "circle-opacity", 0);
}
