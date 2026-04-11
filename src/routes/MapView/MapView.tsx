import { onMount, onCleanup, createEffect } from "solid-js";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createMap, changeMapStyle, destroyMap } from "./MapView.logic";

type Props = {
  center: [number, number];
  zoom: number;
  style: string;
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
  });

  createEffect(() => {
    changeMapStyle(map, props.style);
  });

  onCleanup(() => {
    destroyMap(map);
  });

  return <div ref={container} class="w-full h-dvh" />;
}
