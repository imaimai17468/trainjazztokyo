import type maplibregl from "maplibre-gl";
import railwayData from "./tokyo-railway.json";

const RAILWAY_COLOR = "#9ca3af";

export function addRailwayLayers(map: maplibregl.Map) {
  map.addSource("railway-lines", {
    type: "geojson",
    data: railwayData.lines as GeoJSON.FeatureCollection,
  });

  map.addSource("railway-stations", {
    type: "geojson",
    data: railwayData.stations as GeoJSON.FeatureCollection,
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
}

export function removeRailwayLayers(map: maplibregl.Map) {
  if (map.getLayer("railway-stations")) map.removeLayer("railway-stations");
  if (map.getLayer("railway-lines")) map.removeLayer("railway-lines");
  if (map.getSource("railway-stations")) map.removeSource("railway-stations");
  if (map.getSource("railway-lines")) map.removeSource("railway-lines");
}
