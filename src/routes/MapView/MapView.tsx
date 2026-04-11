import { onMount, onCleanup, createEffect, untrack } from "solid-js";
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
import {
  addRailwayLayers,
  getStations,
  triggerDepartures,
  highlightLines,
} from "./MapView.railway";
import { getDepartures } from "./MapView.timetable";
import AboutContainer from "./About/About.container";
import Intro from "./Intro/Intro";
import Legend from "./Legend/Legend";

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
  let container!: HTMLDivElement;
  let map: maplibregl.Map | undefined;
  let tickInterval: ReturnType<typeof setInterval> | undefined;

  const stations = getStations();

  const startTicking = () => {
    stopTicking();
    tickInterval = setInterval(() => {
      if (!map) return;
      const departures = getDepartures(stations, new Date());
      if (departures.length > 0) {
        triggerDepartures(map, departures);
      }
    }, 100);
  };

  const stopTicking = () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = undefined;
    }
  };

  onMount(() => {
    prefetchStyles();
    map = createMap({
      container,
      center: props.center,
      zoom: props.zoom,
      style: props.style,
    });

    map.on("load", () => {
      if (props.railwayOnly) {
        setBaseLayersVisible(map!, false);
      }
      addRailwayLayers(map!);
      startTicking();
    });
  });

  createEffect(() => {
    const style = props.style;
    if (map) {
      const hide = untrack(() => props.railwayOnly);
      changeMapStyle(map, style, hide);
      map.once("style.load", () => {
        addRailwayLayers(map!);
        if (!hide) {
          setBaseLayersVisible(map!, true);
        }
      });
    }
  });

  createEffect(() => {
    const railwayOnly = props.railwayOnly;
    if (!map) return;
    const apply = () => setBaseLayersVisible(map!, !railwayOnly);
    if (map.isStyleLoaded()) {
      apply();
    } else {
      map.once("style.load", apply);
    }
  });

  onCleanup(() => {
    stopTicking();
    destroyMap(map);
  });

  return (
    <div class="relative w-full h-dvh bg-white transition-colors duration-700 dark:bg-gray-950">
      <div ref={container} class="w-full h-full" />
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
      {!props.introOpen && (
        <Legend
          onHighlight={(lines) => {
            if (map && map.isStyleLoaded()) highlightLines(map, lines);
          }}
        />
      )}
      <AboutContainer />
      <Intro open={props.introOpen} onClose={props.onCloseIntro} />
    </div>
  );
}
