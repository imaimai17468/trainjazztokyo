import type { TrainPosition } from "../entity/train";
import type { Instrument } from "../MapView.lines";

export type TrainGroup = {
  line: string;
  color: string;
  instrument: Instrument;
  startProgress: number;
  endProgress: number;
  trainCount: number;
};

const GROUP_THRESHOLD = 0.05;
const MAX_GROUP_WIDTH = 0.15;

function pushGroup(groups: TrainGroup[], slice: TrainPosition[]) {
  groups.push({
    line: slice[0].line,
    color: slice[0].color,
    instrument: slice[0].instrument,
    startProgress: slice[0].progress,
    endProgress: slice[slice.length - 1].progress,
    trainCount: slice.length,
  });
}

export function groupTrains(positions: TrainPosition[]): TrainGroup[] {
  const byLine = new Map<string, TrainPosition[]>();
  for (const p of positions) {
    const arr = byLine.get(p.line) ?? [];
    arr.push(p);
    byLine.set(p.line, arr);
  }

  const groups: TrainGroup[] = [];

  for (const [, trains] of byLine) {
    const sorted = trains.toSorted((a, b) => a.progress - b.progress);

    let start = 0;
    for (let i = 1; i <= sorted.length; i++) {
      const tooFar =
        i < sorted.length && sorted[i].progress - sorted[i - 1].progress > GROUP_THRESHOLD;
      const tooWide =
        i < sorted.length && sorted[i].progress - sorted[start].progress > MAX_GROUP_WIDTH;

      if (tooFar || tooWide || i === sorted.length) {
        pushGroup(groups, sorted.slice(start, i));
        start = i;
      }
    }
  }

  return groups;
}
