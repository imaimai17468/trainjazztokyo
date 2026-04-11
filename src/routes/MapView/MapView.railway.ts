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

export function triggerDepartures(map: maplibregl.Map, departures: DepartureEvent[]) {
  const source = map.getSource("railway-pulse") as maplibregl.GeoJSONSource | undefined;
  if (!source) return;

  const features = departures.map((d) => ({
    type: "Feature" as const,
    properties: { color: d.color, opacity: 1, radius: 3 },
    geometry: {
      type: "Point" as const,
      coordinates: d.coordinates,
    },
  }));

  source.setData({ type: "FeatureCollection", features });

  // Animate fade out
  let frame = 0;
  const totalFrames = 40;

  function animate() {
    frame++;
    const progress = frame / totalFrames;
    const opacity = 1 - progress;
    const radius = 3 + progress * 15;

    const updated = features.map((f) => ({
      ...f,
      properties: { ...f.properties, opacity, radius },
    }));

    source!.setData({ type: "FeatureCollection", features: updated });

    if (frame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      source!.setData({ type: "FeatureCollection", features: [] });
    }
  }

  requestAnimationFrame(animate);
}

export function removeRailwayLayers(map: maplibregl.Map) {
  for (const id of ["railway-pulse-glow", "railway-pulse", "railway-stations", "railway-lines"]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  for (const id of ["railway-pulse", "railway-stations", "railway-lines"]) {
    if (map.getSource(id)) map.removeSource(id);
  }
}
