import type maplibregl from "maplibre-gl";
import type { TrainPosition } from "./entity/train";
import { createTrainGateway } from "./gateway/trainGateway";
import { groupTrains } from "./gateway/groupTrains";
import {
  updateTrainGroups,
  triggerGroupPulse,
  setScanPosition,
  getGroupCoords,
} from "./MapView.railway";
import { getMorphProgress, interpolateFeatures } from "./MapView.morph";
import { playGroupNote } from "./MapView.sound";

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

  let currentGroups = groupTrains([]);

  let currentPositions: TrainPosition[] = [];

  const sync = (pos: TrainPosition[]) => {
    callbacks.onPositions(pos);
    currentPositions = pos;
    currentGroups = groupTrains(pos);

    const map = callbacks.getMap();
    if (!map) return;
    updateTrainGroups(map, currentGroups, currentPositions);

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
      const pos = gateway.getPositions();
      if (pos.length > 0) {
        sync(pos);
        snapshotStart = performance.now();
        firedThisCycle.clear();
      }
    }, gateway.snapshotInterval);

    pulseTimer = setInterval(() => {
      const map = callbacks.getMap();
      if (!map) return;

      const elapsed = performance.now() - snapshotStart;
      const scanPos = Math.min(elapsed / gateway.snapshotInterval, 1);
      callbacks.onScanProgress(scanPos);
      setScanPosition(scanPos);
      updateTrainGroups(map, currentGroups, currentPositions);

      const firingThisTick: number[] = [];
      currentGroups.forEach((g, i) => {
        if (firedThisCycle.has(i)) return;
        if (g.startProgress >= scanPos - SCAN_WINDOW && g.startProgress <= scanPos) {
          firingThisTick.push(i);
        }
      });

      const soloistActive = firingThisTick.some(
        (i) =>
          currentGroups[i].instrument === "trombone" || currentGroups[i].instrument === "saxophone",
      );

      firingThisTick.forEach((i) => {
        firedThisCycle.add(i);
        const g = currentGroups[i];
        triggerGroupPulse(map, g);
        playGroupNote(g, getGroupCoords(g), scanPos, firingThisTick.length, soloistActive);
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
