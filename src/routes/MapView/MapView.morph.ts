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

type BarTarget = {
  lat: number;
  lonStart: number;
  lonEnd: number;
};

type OriginalSegment = {
  line: string;
  coordinates: [number, number][];
};

type LineRange = {
  minLon: number;
  maxLon: number;
};

let originalSegments: OriginalSegment[] = [];
let lineRanges: Map<string, LineRange> = new Map();
let barTargets: Map<string, BarTarget> = new Map();
let animationId: number | undefined;
let currentProgress = 0;

function buildOriginalData() {
  originalSegments = railwayData.lines.features.map((f) => ({
    line: f.properties.line as string,
    coordinates: f.geometry.coordinates as [number, number][],
  }));

  const ranges = new Map<string, { min: number; max: number }>();
  originalSegments.forEach((seg) => {
    const existing = ranges.get(seg.line) ?? { min: Infinity, max: -Infinity };
    seg.coordinates.forEach(([lon]) => {
      existing.min = Math.min(existing.min, lon);
      existing.max = Math.max(existing.max, lon);
    });
    ranges.set(seg.line, existing);
  });

  lineRanges = new Map(
    [...ranges.entries()].map(([name, r]) => [name, { minLon: r.min, maxLon: r.max }]),
  );
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

function coordToBarLon(lon: number, range: LineRange, target: BarTarget): number {
  const span = range.maxLon - range.minLon;
  const fraction = span > 0 ? (lon - range.minLon) / span : 0.5;
  return lerp(target.lonStart, target.lonEnd, fraction);
}

export function interpolateFeatures(progress: number): GeoJSON.FeatureCollection {
  const features = originalSegments.map((seg) => {
    const target = barTargets.get(seg.line);
    const range = lineRanges.get(seg.line);
    if (!target || !range) {
      return {
        type: "Feature" as const,
        properties: { line: seg.line },
        geometry: { type: "LineString" as const, coordinates: seg.coordinates },
      };
    }

    const coords = seg.coordinates.map((coord) => {
      const barLon = coordToBarLon(coord[0], range, target);
      const barLat = target.lat;
      return [lerp(coord[0], barLon, progress), lerp(coord[1], barLat, progress)] as [
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
    const barLat = target.lat;

    return {
      ...p,
      coordinates: [
        lerp(p.coordinates[0], barLon, progress),
        lerp(p.coordinates[1], barLat, progress),
      ] as [number, number],
    };
  });
}

export function morphToBars(map: maplibregl.Map, positions: TrainPosition[]) {
  if (originalSegments.length === 0) buildOriginalData();
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
  if (originalSegments.length === 0) buildOriginalData();
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
      const lineSource2 = map.getSource("railway-lines") as maplibregl.GeoJSONSource | undefined;
      if (lineSource2) lineSource2.setData(railwayData.lines as GeoJSON.FeatureCollection);
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
  const barLat = target.lat;
  return [lerp(coord[0], barLon, currentProgress), lerp(coord[1], barLat, currentProgress)];
}
