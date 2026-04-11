import { onMount, onCleanup, createEffect } from "solid-js";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { TrainFront } from "lucide-solid";
import { createMap, changeMapStyle, setBaseLayersVisible, destroyMap } from "./MapView.logic";
import { addRailwayLayers } from "./MapView.railway";
import AboutContainer from "./About/About.container";

type Props = {
  center: [number, number];
  zoom: number;
  style: string;
  railwayOnly: boolean;
  onToggleRailwayOnly: () => void;
};

export default function MapView(props: Props) {
  let container!: HTMLDivElement;
  let map: maplibregl.Map | undefined;

  onMount(() => {
    map = createMap({
      container,
      center: props.center,
      zoom: props.zoom,
      style: props.style,
    });

    map.on("load", () => {
      addRailwayLayers(map!);
      if (props.railwayOnly) {
        setBaseLayersVisible(map!, false);
      }
    });
  });

  createEffect(() => {
    const style = props.style;
    if (map) {
      changeMapStyle(map, style);
      map.once("style.load", () => {
        addRailwayLayers(map!);
        if (props.railwayOnly) {
          setBaseLayersVisible(map!, false);
        }
      });
    }
  });

  createEffect(() => {
    const railwayOnly = props.railwayOnly;
    if (map && map.isStyleLoaded()) {
      setBaseLayersVisible(map, !railwayOnly);
    }
  });

  onCleanup(() => {
    destroyMap(map);
  });

  return (
    <div class="relative w-full h-dvh">
      <div ref={container} class="w-full h-full" />
      <button
        type="button"
        onClick={props.onToggleRailwayOnly}
        class="fixed bottom-4 right-14 z-50 rounded-full bg-gray-200 p-1.5 text-gray-500 transition-colors duration-700 dark:bg-gray-800 dark:text-gray-400"
        aria-label={props.railwayOnly ? "地図を表示" : "線路のみ表示"}
      >
        <TrainFront size={16} />
      </button>
      <AboutContainer />
    </div>
  );
}
