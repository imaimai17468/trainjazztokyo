import type maplibregl from "maplibre-gl";
import type { TrainPosition } from "./entity/train";
import { createTrainGateway } from "./gateway/trainGateway";
import { updateTrainPositions, triggerPulse } from "./MapView.railway";
import { getMorphProgress, interpolateFeatures } from "./MapView.morph";
import { playNote } from "./MapView.sound";

const SCAN_WINDOW = 0.03;

type TickerCallbacks = {
  getMap: () => maplibregl.Map | undefined;
  onPositions: (positions: TrainPosition[]) => void;
  onScanProgress: (progress: number) => void;
};

export function createTicker(callbacks: TickerCallbacks) {
  const gateway = createTrainGateway();
  let snapshotTimer: ReturnType<typeof setInterval> | undefined;
  let pulseTimer: ReturnType<typeof setInterval> | undefined;
  let snapshotStart = 0;
  const firedThisCycle = new Set<number>();

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
    snapshotStart = performance.now();
    firedThisCycle.clear();

    snapshotTimer = setInterval(async () => {
      await gateway.refresh();
      sync(gateway.getPositions());
      snapshotStart = performance.now();
      firedThisCycle.clear();
    }, gateway.snapshotInterval);

    pulseTimer = setInterval(() => {
      const map = callbacks.getMap();
      if (!map) return;

      const elapsed = performance.now() - snapshotStart;
      const scanPos = Math.min(elapsed / gateway.snapshotInterval, 1);
      callbacks.onScanProgress(scanPos);

      gateway.getPositions().forEach((p, i) => {
        if (firedThisCycle.has(i)) return;
        if (p.progress >= scanPos - SCAN_WINDOW && p.progress <= scanPos) {
          firedThisCycle.add(i);
          triggerPulse(map, p);
          playNote(p);
        }
      });
    }, 50);
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
