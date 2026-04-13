import type maplibregl from "maplibre-gl";
import type { TrainPosition } from "./entity/train";
import { createTrainGateway } from "./gateway/trainGateway";
import { updateTrainPositions, triggerPulse } from "./MapView.railway";
import { getMorphProgress, interpolateFeatures } from "./MapView.morph";

const PULSE_CHANCE = 0.015;

type TickerCallbacks = {
  getMap: () => maplibregl.Map | undefined;
  onPositions: (positions: TrainPosition[]) => void;
};

export function createTicker(callbacks: TickerCallbacks) {
  const gateway = createTrainGateway();
  let snapshotTimer: ReturnType<typeof setInterval> | undefined;
  let pulseTimer: ReturnType<typeof setInterval> | undefined;

  const sync = (pos: TrainPosition[]) => {
    callbacks.onPositions(pos);
    const map = callbacks.getMap();
    if (!map) return;
    updateTrainPositions(map, pos);

    const mp = getMorphProgress();
    if (mp > 0) {
      const lineSource = map.getSource("railway-lines") as maplibregl.GeoJSONSource | undefined;
      if (lineSource) lineSource.setData(interpolateFeatures(mp));
    }
  };

  const start = async () => {
    stop();
    await gateway.init();
    sync(gateway.getPositions());

    snapshotTimer = setInterval(async () => {
      await gateway.refresh();
      sync(gateway.getPositions());
    }, gateway.snapshotInterval);

    pulseTimer = setInterval(() => {
      const map = callbacks.getMap();
      if (!map) return;
      gateway
        .getPositions()
        .filter(() => Math.random() < PULSE_CHANCE)
        .forEach((p) => triggerPulse(map, p));
    }, 100);
  };

  const stop = () => {
    if (snapshotTimer) {
      clearInterval(snapshotTimer);
      snapshotTimer = undefined;
    }
    if (pulseTimer) {
      clearInterval(pulseTimer);
      pulseTimer = undefined;
    }
  };

  return { start, stop };
}
