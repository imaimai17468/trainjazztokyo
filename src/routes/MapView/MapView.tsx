import { onMount, onCleanup, createEffect, untrack, createSignal } from "solid-js";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Globe } from "lucide-solid";
import {
  createMap,
  changeMapStyle,
  setBaseLayersVisible,
  destroyMap,
  prefetchStyles,
} from "./MapView.logic";
import { addRailwayLayers, highlightLines, resetPulseState } from "./MapView.railway";
import { createTicker } from "./MapView.ticker";
import type { TrainPosition } from "./entity/train";
import AboutContainer from "./About/About.container";
import Intro from "./Intro/Intro";
import Legend from "./Legend/Legend";
import Bars from "./Bars/Bars";

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

  const ticker = createTicker({
    getMap: () => map,
    onPositions: setPositions,
  });

  onMount(() => {
    prefetchStyles();
    map = createMap({ container, center: props.center, zoom: props.zoom, style: props.style });
    map.on("load", () => {
      if (props.railwayOnly) setBaseLayersVisible(map!, false);
      addRailwayLayers(map!);
      ticker.start();
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
    ticker.stop();
    resetPulseState();
    destroyMap(map);
  });

  return (
    <div class="relative w-full h-dvh bg-white transition-colors duration-700 dark:bg-gray-950">
      <div
        ref={container}
        class="w-full h-full transition-opacity duration-700"
        classList={{
          "opacity-100": mode() === "map",
          "opacity-0 pointer-events-none": mode() === "bars",
        }}
      />
      <Bars positions={positions()} visible={mode() === "bars"} />
      {!props.introOpen && (
        <>
          <button
            type="button"
            onClick={props.onToggleRailwayOnly}
            class="fixed bottom-4 right-14 z-50 rounded-full p-1.5 transition-colors duration-700"
            classList={{
              "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400": props.railwayOnly,
              "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900": !props.railwayOnly,
            }}
            aria-label={props.railwayOnly ? "地図を表示" : "線路のみ表示"}
          >
            <Globe size={16} />
          </button>
        </>
      )}
      <Legend
        visible={!props.introOpen && !aboutOpen()}
        mode={mode()}
        onToggleMode={() => setMode((m) => (m === "map" ? "bars" : "map"))}
        onHighlight={(lines) => {
          if (map && map.isStyleLoaded()) highlightLines(map, lines);
        }}
      />
      {!props.introOpen && <AboutContainer onOpenChange={setAboutOpen} />}
      <Intro open={props.introOpen} onClose={props.onCloseIntro} />
    </div>
  );
}
