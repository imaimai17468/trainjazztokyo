import { onMount, onCleanup, createEffect, untrack, createSignal } from "solid-js";
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
import { stopSound, setSoloLine } from "./MapView.sound";
import { groupTrains } from "./gateway/groupTrains";
import type { TrainPosition } from "./entity/train";
import AboutContainer from "./About/About.container";
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

export default function MapView(props: Props) {
  // eslint-disable-next-line no-unassigned-vars -- SolidJS ref pattern
  let container!: HTMLDivElement;
  let map: maplibregl.Map | undefined;
  const [aboutOpen, setAboutOpen] = createSignal(false);
  const [mode, setMode] = createSignal<"map" | "bars">("map");
  const [positions, setPositions] = createSignal<TrainPosition[]>([]);
  const [barsHighlight, setBarsHighlight] = createSignal<string | null>(null);
  const [scanProgress, setScanProgress] = createSignal(0);

  const ticker = createTicker({
    getMap: () => map,
    onPositions: setPositions,
    onScanProgress: setScanProgress,
  });

  const toggleMode = () => {
    if (!map) return;
    const next = mode() === "map" ? "bars" : "map";
    setMode(next);
    const groups = groupTrains(positions());
    if (next === "bars") {
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
      morphToBars(map, positions(), groups, positions());
    } else {
      morphToMap(map, positions(), groups, positions());
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoomRotate.enable();
    }
  };

  onMount(() => {
    prefetchStyles();
    map = createMap({ container, center: props.center, zoom: props.zoom, style: props.style });
    map.on("load", () => {
      if (props.railwayOnly) setBaseLayersVisible(map!, false);
      addRailwayLayers(map!);
      ticker.start();
    });

    map.on("mousemove", (e) => {
      if (mode() !== "bars") return;
      const line = getLineFromY(e.point.y, map!.getContainer().clientHeight);
      setBarsHighlight(line);
      setSoloLine(line);
      if (line) highlightLines(map!, [line]);
      else highlightLines(map!, null);
    });
    map.on("click", (e) => {
      if (mode() !== "bars") return;
      const line = getLineFromY(e.point.y, map!.getContainer().clientHeight);
      if (line) {
        highlightLines(map!, [line]);
        setSoloLine(line);
      } else {
        highlightLines(map!, null);
        setSoloLine(null);
      }
    });
  });

  createEffect(() => {
    const style = props.style;
    if (!map) return;
    const hide = untrack(() => props.railwayOnly);
    changeMapStyle(map, style, hide);
    map.once("style.load", () => {
      addRailwayLayers(map!);
      if (!hide) setBaseLayersVisible(map!, true);
    });
  });

  createEffect(() => {
    const railwayOnly = props.railwayOnly;
    if (!map) return;
    const apply = () => setBaseLayersVisible(map!, !railwayOnly);
    if (map.isStyleLoaded()) apply();
    else map.once("style.load", apply);
  });

  onCleanup(() => {
    cancelMorph();
    ticker.stop();
    stopSound();
    resetPulseState();
    destroyMap(map);
  });

  return (
    <div class="relative w-full h-dvh bg-white transition-colors duration-700 dark:bg-gray-950">
      <div ref={container} class="w-full h-full" />
      {!props.introOpen && positions().length > 0 && (
        <div class="fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-1.5">
          <div class="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span class="text-xs text-gray-400 dark:text-gray-500 tracking-wide">
            {positions().length} trains running
          </span>
        </div>
      )}
      <Bars visible={mode() === "bars"} scanProgress={scanProgress()} positions={positions()} />
      {!props.introOpen && (
        <Controls
          railwayOnly={props.railwayOnly}
          onToggleRailwayOnly={props.onToggleRailwayOnly}
          onLocationChange={(coords) => updateUserLocation(map, coords)}
        />
      )}
      <Legend
        visible={!props.introOpen && !aboutOpen() && mode() !== "bars"}
        mode={mode()}
        barsHighlight={barsHighlight()}
        onToggleMode={toggleMode}
        onHighlight={(lines) => {
          setSoloLine(lines?.[0] ?? null);
          if (map && map.isStyleLoaded()) highlightLines(map, lines);
        }}
      />
      {!props.introOpen && <AboutContainer onOpenChange={setAboutOpen} />}
    </div>
  );
}
