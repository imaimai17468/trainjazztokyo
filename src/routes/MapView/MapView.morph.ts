import type maplibregl from "maplibre-gl";
import railwayData from "./tokyo-railway.json";
import type { TrainPosition } from "./entity/train";

const LINE_ORDER = [
  "山手線",
  "中央線快速",
  "京浜東北線",
  "中央・総武緩行線",
  "東京メトロ銀座線",
  "東京メトロ丸ノ内線",
  "東京メトロ日比谷線",
  "東京メトロ東西線",
  "都営浅草線",
  "都営新宿線",
  "都営大江戸線",
  "東京メトロ千代田線",
  "東京メトロ有楽町線",
  "東京メトロ半蔵門線",
  "東京メトロ南北線",
  "東京メトロ副都心線",
  "埼京線",
  "都営三田線",
  "東急東横線",
  "東急田園都市線",
  "小田急小田原線",
  "京王線",
  "湘南新宿ライン",
  "上野東京ライン",
];

const ROW_HEIGHT = 16;
const MARGIN_LEFT = 0.06;
const MARGIN_RIGHT = 0.06;
const ANIMATION_DURATION = 900;
const CHAIN_THRESHOLD = 0.005;

type BarTarget = {
  lat: number;
  lonStart: number;
  lonEnd: number;
};

type MorphSegment = {
  line: string;
  coordinates: [number, number][];
  barFracs: number[];
};

let morphSegments: MorphSegment[] = [];
let barTargets: Map<string, BarTarget> = new Map();
let animationId: number | undefined;
let currentProgress = 0;

function ptDist(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function chainSegments(segs: [number, number][][]): [number, number][][] {
  const remaining = segs.map((s) => [...s]);
  const chains: [number, number][][] = [];

  while (remaining.length > 0) {
    const chain = remaining.shift()!;
    let changed = true;
    while (changed && remaining.length > 0) {
      changed = false;
      const bestIdx = remaining.reduce(
        (best, seg, i) => {
          const dists = [
            ptDist(chain[chain.length - 1], seg[0]),
            ptDist(chain[chain.length - 1], seg[seg.length - 1]),
            ptDist(chain[0], seg[seg.length - 1]),
            ptDist(chain[0], seg[0]),
          ];
          const minD = Math.min(...dists);
          const minType = dists.indexOf(minD);
          return minD < best.dist ? { idx: i, dist: minD, type: minType } : best;
        },
        { idx: -1, dist: CHAIN_THRESHOLD, type: -1 },
      );

      if (bestIdx.idx === -1) break;

      const seg = remaining.splice(bestIdx.idx, 1)[0];
      if (bestIdx.type === 0) chain.push(...seg.slice(1));
      else if (bestIdx.type === 1) chain.push(...seg.toReversed().slice(1));
      else if (bestIdx.type === 2) chain.unshift(...seg.slice(0, -1));
      else chain.unshift(...seg.toReversed().slice(0, -1));
      changed = true;
    }
    chains.push(chain);
  }

  return chains;
}

function buildCumulativeFracs(chain: [number, number][]): number[] {
  const dists = [0];
  chain.reduce((prev, curr, i) => {
    if (i === 0) return curr;
    dists.push(dists[i - 1] + ptDist(prev, curr));
    return curr;
  }, chain[0]);
  const total = dists[dists.length - 1];
  return total > 0 ? dists.map((d) => d / total) : dists.map(() => 0);
}

function buildOriginalData() {
  const rawByLine = new Map<string, [number, number][][]>();
  railwayData.lines.features.forEach((f) => {
    const name = f.properties.line as string;
    const coords = f.geometry.coordinates as [number, number][];
    const arr = rawByLine.get(name) ?? [];
    arr.push(coords);
    rawByLine.set(name, arr);
  });

  morphSegments = [];

  rawByLine.forEach((segs, line) => {
    const chains = chainSegments(segs);

    const chainLengths = chains.map((c) =>
      c.reduce((sum, pt, i) => (i === 0 ? 0 : sum + ptDist(c[i - 1], pt)), 0),
    );
    const totalLength = chainLengths.reduce((a, b) => a + b, 0);
    if (totalLength === 0) return;

    let chainOffset = 0;
    chains.forEach((chain, ci) => {
      const chainFrac = chainLengths[ci] / totalLength;
      const fracs = buildCumulativeFracs(chain);
      const globalFracs = fracs.map((f) => chainOffset + f * chainFrac);

      morphSegments.push({
        line,
        coordinates: chain,
        barFracs: globalFracs,
      });

      chainOffset += chainFrac;
    });
  });
}

function buildBarTargets(map: maplibregl.Map) {
  const bounds = map.getBounds();
  const lonRange = bounds.getEast() - bounds.getWest();
  const latRange = bounds.getNorth() - bounds.getSouth();
  const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
  const totalHeight = LINE_ORDER.length * ROW_HEIGHT;

  const pixelPerLat = map.getContainer().clientHeight / latRange;
  const rowLatSpan = ROW_HEIGHT / pixelPerLat;
  const totalLatSpan = totalHeight / pixelPerLat;
  const topLat = centerLat + totalLatSpan / 2;

  const lonStart = bounds.getWest() + lonRange * MARGIN_LEFT;
  const lonEnd = bounds.getEast() - lonRange * MARGIN_RIGHT;

  barTargets = new Map(
    LINE_ORDER.map((name, i) => [name, { lat: topLat - (i + 0.5) * rowLatSpan, lonStart, lonEnd }]),
  );
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function interpolateFeatures(progress: number): GeoJSON.FeatureCollection {
  const features = morphSegments.map((seg) => {
    const target = barTargets.get(seg.line);
    if (!target) {
      return {
        type: "Feature" as const,
        properties: { line: seg.line },
        geometry: { type: "LineString" as const, coordinates: seg.coordinates },
      };
    }

    const coords = seg.coordinates.map((coord, i) => {
      const barLon = lerp(target.lonStart, target.lonEnd, seg.barFracs[i]);
      return [lerp(coord[0], barLon, progress), lerp(coord[1], target.lat, progress)] as [
        number,
        number,
      ];
    });

    return {
      type: "Feature" as const,
      properties: { line: seg.line },
      geometry: { type: "LineString" as const, coordinates: coords },
    };
  });

  return { type: "FeatureCollection", features };
}

function interpolateTrains(positions: TrainPosition[], progress: number): TrainPosition[] {
  return positions.map((p) => {
    const target = barTargets.get(p.line);
    if (!target) return p;

    const barLon = lerp(target.lonStart, target.lonEnd, p.progress);
    return {
      ...p,
      coordinates: [
        lerp(p.coordinates[0], barLon, progress),
        lerp(p.coordinates[1], target.lat, progress),
      ] as [number, number],
    };
  });
}

export function morphToBars(map: maplibregl.Map, positions: TrainPosition[]) {
  if (morphSegments.length === 0) buildOriginalData();
  buildBarTargets(map);
  cancelMorph();

  const start = performance.now();
  const animate = () => {
    const elapsed = performance.now() - start;
    const t = Math.min(elapsed / ANIMATION_DURATION, 1);
    const p = easeInOutCubic(t);
    currentProgress = p;

    const lineSource = map.getSource("railway-lines") as maplibregl.GeoJSONSource | undefined;
    if (lineSource) lineSource.setData(interpolateFeatures(p));

    const trainSource = map.getSource("railway-trains") as maplibregl.GeoJSONSource | undefined;
    if (trainSource) {
      const morphed = interpolateTrains(positions, p);
      trainSource.setData({
        type: "FeatureCollection",
        features: morphed.map((pos) => ({
          type: "Feature" as const,
          properties: { color: pos.color, line: pos.line },
          geometry: { type: "Point" as const, coordinates: pos.coordinates },
        })),
      });
    }

    if (t < 1) animationId = requestAnimationFrame(animate);
  };
  animationId = requestAnimationFrame(animate);
}

export function morphToMap(map: maplibregl.Map, positions: TrainPosition[]) {
  if (morphSegments.length === 0) buildOriginalData();
  cancelMorph();

  const start = performance.now();
  const animate = () => {
    const elapsed = performance.now() - start;
    const t = Math.min(elapsed / ANIMATION_DURATION, 1);
    const p = 1 - easeInOutCubic(t);
    currentProgress = p;

    const lineSource = map.getSource("railway-lines") as maplibregl.GeoJSONSource | undefined;
    if (lineSource) lineSource.setData(interpolateFeatures(p));

    const trainSource = map.getSource("railway-trains") as maplibregl.GeoJSONSource | undefined;
    if (trainSource) {
      const morphed = interpolateTrains(positions, p);
      trainSource.setData({
        type: "FeatureCollection",
        features: morphed.map((pos) => ({
          type: "Feature" as const,
          properties: { color: pos.color, line: pos.line },
          geometry: { type: "Point" as const, coordinates: pos.coordinates },
        })),
      });
    }

    if (t < 1) animationId = requestAnimationFrame(animate);
    else {
      const src = map.getSource("railway-lines") as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(railwayData.lines as GeoJSON.FeatureCollection);
    }
  };
  animationId = requestAnimationFrame(animate);
}

export function cancelMorph() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = undefined;
  }
}

export function getMorphProgress(): number {
  return currentProgress;
}

export function morphTrainCoordinate(
  line: string,
  coord: [number, number],
  trainProgress: number,
): [number, number] {
  const target = barTargets.get(line);
  if (!target || currentProgress === 0) return coord;

  const barLon = lerp(target.lonStart, target.lonEnd, trainProgress);
  return [lerp(coord[0], barLon, currentProgress), lerp(coord[1], target.lat, currentProgress)];
}
