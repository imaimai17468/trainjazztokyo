import { useEffect, useRef, useState, useCallback } from "react";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Controls from "./Controls/Controls";
import {
  createMap,
  changeMapStyle,
  setBaseLayersVisible,
  destroyMap,
  prefetchStyles,
} from "./MapView.logic";
import { addRailwayLayers, highlightLines, resetPulseState } from "./MapView.railway";
import { createTicker } from "./MapView.ticker";
import { morphToBars, morphToMap, cancelMorph } from "./MapView.morph";
import { initSound, stopSound, setSoloLine } from "./MapView.sound";
import { groupTrains } from "./gateway/groupTrains";
import type { TrainPosition } from "./entity/train";
import AboutContainer from "./About/About.container";
import Intro from "./Intro/Intro";
import Legend from "./Legend/Legend";
import Bars, { LINE_ORDER, ROW_HEIGHT } from "./Bars/Bars";

function updateUserLocation(map: maplibregl.Map | undefined, coords: [number, number] | null) {
  if (!map) return;
  let source = map.getSource("user-location") as maplibregl.GeoJSONSource | undefined;
  if (!source) {
    map.addSource("user-location", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    map.addLayer({
      id: "user-location",
      type: "circle",
      source: "user-location",
      paint: {
        "circle-color": "#3b82f6",
        "circle-radius": 6,
        "circle-opacity": 0.9,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    });
    source = map.getSource("user-location") as maplibregl.GeoJSONSource;
  }
  const features = coords
    ? [
        {
          type: "Feature" as const,
          properties: {},
          geometry: { type: "Point" as const, coordinates: coords },
        },
      ]
    : [];
  source.setData({ type: "FeatureCollection", features });
}

function getLineFromY(y: number, containerHeight: number): string | null {
  const totalH = LINE_ORDER.length * ROW_HEIGHT;
  const topY = (containerHeight - totalH) / 2;
  const row = Math.floor((y - topY) / ROW_HEIGHT);
  if (row < 0 || row >= LINE_ORDER.length) return null;
  return LINE_ORDER[row].name;
}

type Props = {
  center: [number, number];
  zoom: number;
  style: string;
  railwayOnly: boolean;
  onToggleRailwayOnly: () => void;
  introOpen: boolean;
  onCloseIntro: () => void;
};

export default function MapView({
  center,
  zoom,
  style,
  railwayOnly,
  onToggleRailwayOnly,
  introOpen,
  onCloseIntro,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | undefined>(undefined);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mode, setMode] = useState<"map" | "bars">("map");
  const [positions, setPositions] = useState<TrainPosition[]>([]);
  const [barsHighlight, setBarsHighlight] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const tickerRef = useRef<ReturnType<typeof createTicker> | null>(null);
  const railwayOnlyRef = useRef(railwayOnly);
  railwayOnlyRef.current = railwayOnly;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const toggleMode = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    setMode((prev) => {
      const next = prev === "map" ? "bars" : "map";
      setPositions((currentPositions) => {
        const groups = groupTrains(currentPositions);
        if (next === "bars") {
          map.dragPan.disable();
          map.scrollZoom.disable();
          map.doubleClickZoom.disable();
          map.touchZoomRotate.disable();
          morphToBars(map, currentPositions, groups, currentPositions);
        } else {
          morphToMap(map, currentPositions, groups, currentPositions);
          map.dragPan.enable();
          map.scrollZoom.enable();
          map.doubleClickZoom.enable();
          map.touchZoomRotate.enable();
        }
        return currentPositions;
      });
      return next;
    });
  }, []);

  useEffect(() => {
    prefetchStyles();
    const container = containerRef.current;
    if (!container) return;

    const map = createMap({ container, center, zoom, style });
    mapRef.current = map;

    const ticker = createTicker({
      getMap: () => mapRef.current,
      onPositions: setPositions,
      onScanProgress: setScanProgress,
    });
    tickerRef.current = ticker;

    map.on("load", () => {
      if (railwayOnlyRef.current) setBaseLayersVisible(map, false);
      addRailwayLayers(map);
      ticker.start();
    });

    map.on("mousemove", (e) => {
      if (modeRef.current !== "bars") return;
      const line = getLineFromY(e.point.y, map.getContainer().clientHeight);
      setBarsHighlight(line);
      setSoloLine(line);
      if (line) highlightLines(map, [line]);
      else highlightLines(map, null);
    });
    map.on("click", (e) => {
      if (modeRef.current !== "bars") return;
      const line = getLineFromY(e.point.y, map.getContainer().clientHeight);
      if (line) {
        highlightLines(map, [line]);
        setSoloLine(line);
      } else {
        highlightLines(map, null);
        setSoloLine(null);
      }
    });

    return () => {
      cancelMorph();
      ticker.stop();
      stopSound();
      resetPulseState();
      destroyMap(map);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const hide = railwayOnlyRef.current;
    changeMapStyle(map, style, hide);
    map.once("style.load", () => {
      addRailwayLayers(map);
      if (!hide) setBaseLayersVisible(map, true);
    });
  }, [style]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => setBaseLayersVisible(map, !railwayOnly);
    if (map.isStyleLoaded()) apply();
    else map.once("style.load", apply);
  }, [railwayOnly]);

  return (
    <div className="relative w-full h-dvh bg-white transition-colors duration-700 dark:bg-gray-950">
      <div ref={containerRef} className="w-full h-full" />
      {!introOpen && positions.length > 0 && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-gray-400 dark:text-gray-500 tracking-wide">
            {positions.length} trains running
          </span>
        </div>
      )}
      <Bars visible={mode === "bars"} scanProgress={scanProgress} positions={positions} />
      {!introOpen && (
        <Controls
          railwayOnly={railwayOnly}
          onToggleRailwayOnly={onToggleRailwayOnly}
          onLocationChange={(coords) => updateUserLocation(mapRef.current, coords)}
        />
      )}
      <Legend
        visible={!introOpen && !aboutOpen && mode !== "bars"}
        mode={mode}
        barsHighlight={barsHighlight}
        onToggleMode={toggleMode}
        onHighlight={(lines) => {
          setSoloLine(lines?.[0] ?? null);
          const map = mapRef.current;
          if (map && map.isStyleLoaded()) highlightLines(map, lines);
        }}
      />
      {!introOpen && <AboutContainer onOpenChange={setAboutOpen} />}
      <Intro
        open={introOpen}
        onClose={() => {
          initSound();
          onCloseIntro();
        }}
      />
    </div>
  );
}
