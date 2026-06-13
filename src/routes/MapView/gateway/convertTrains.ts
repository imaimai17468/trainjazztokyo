import type { OdptTrain } from "../entity/odpt";
import type { TrainPosition } from "../entity/train";
import { LINE_COLORS, LINE_INSTRUMENTS, RAILWAY_COLOR } from "../MapView.lines";
import railwayData from "../tokyo-railway.json";
import stationData from "../tokyo-stations.json";

const RAILWAY_TO_LINE: Record<string, string> = {
  "JR-East.Yamanote": "山手線",
  "JR-East.ChuoRapid": "中央線快速",
  "JR-East.ChuoSobuLocal": "中央・総武緩行線",
  "JR-East.KeihinTohoku": "京浜東北線",
  "JR-East.Saikyo": "埼京線",
  "JR-East.ShonanShinjuku": "湘南新宿ライン",
  "JR-East.UenoTokyo": "上野東京ライン",
  "TokyoMetro.Ginza": "東京メトロ銀座線",
  "TokyoMetro.Marunouchi": "東京メトロ丸ノ内線",
  "TokyoMetro.Hibiya": "東京メトロ日比谷線",
  "TokyoMetro.Tozai": "東京メトロ東西線",
  "TokyoMetro.Chiyoda": "東京メトロ千代田線",
  "TokyoMetro.Yurakucho": "東京メトロ有楽町線",
  "TokyoMetro.Hanzomon": "東京メトロ半蔵門線",
  "TokyoMetro.Namboku": "東京メトロ南北線",
  "TokyoMetro.Fukutoshin": "東京メトロ副都心線",
  "Toei.Asakusa": "都営浅草線",
  "Toei.Mita": "都営三田線",
  "Toei.Shinjuku": "都営新宿線",
  "Toei.Oedo": "都営大江戸線",
  "Tokyu.Toyoko": "東急東横線",
  "Tokyu.DenEnToshi": "東急田園都市線",
  "Odakyu.Odawara": "小田急小田原線",
  "Keio.Keio": "京王線",
};

type StationEntry = { id: string; name: string; fraction: number };
type LineGeometry = { coords: [number, number][]; cumLengths: number[] };

let lineGeometries: Map<string, LineGeometry> | undefined;
let stationFractions: Map<string, number> | undefined;

function ptDist(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

const CHAIN_THRESHOLD = 0.005;

function chainSegments(segs: [number, number][][]): [number, number][] {
  const remaining = segs.map((s) => [...s]);
  const chains: [number, number][][] = [];

  while (remaining.length > 0) {
    const chain = remaining.shift()!;
    let changed = true;
    while (changed && remaining.length > 0) {
      changed = false;
      let bestIdx = -1;
      let bestDist = CHAIN_THRESHOLD;
      let bestType = -1;

      for (let i = 0; i < remaining.length; i++) {
        const seg = remaining[i];
        const dists = [
          ptDist(chain[chain.length - 1], seg[0]),
          ptDist(chain[chain.length - 1], seg[seg.length - 1]),
          ptDist(chain[0], seg[seg.length - 1]),
          ptDist(chain[0], seg[0]),
        ];
        const minD = Math.min(...dists);
        const minType = dists.indexOf(minD);
        if (minD < bestDist) {
          bestIdx = i;
          bestDist = minD;
          bestType = minType;
        }
      }

      if (bestIdx === -1) break;
      const seg = remaining.splice(bestIdx, 1)[0];
      if (bestType === 0) chain.push(...seg.slice(1));
      else if (bestType === 1) chain.push(...seg.toReversed().slice(1));
      else if (bestType === 2) chain.unshift(...seg.slice(0, -1));
      else chain.unshift(...seg.toReversed().slice(0, -1));
      changed = true;
    }
    chains.push(chain);
  }

  return chains.reduce((best, c) => {
    const len = c.reduce((sum, pt, i) => (i === 0 ? 0 : sum + ptDist(c[i - 1], pt)), 0);
    const bestLen = best.reduce((sum, pt, i) => (i === 0 ? 0 : sum + ptDist(best[i - 1], pt)), 0);
    return len > bestLen ? c : best;
  }, chains[0] ?? []);
}

function buildLineGeometries(): Map<string, LineGeometry> {
  if (lineGeometries) return lineGeometries;

  const segsByLine = new Map<string, [number, number][][]>();
  for (const f of railwayData.lines.features) {
    const name = f.properties.line as string;
    const coords = f.geometry.coordinates as [number, number][];
    const arr = segsByLine.get(name) ?? [];
    arr.push(coords);
    segsByLine.set(name, arr);
  }

  lineGeometries = new Map(
    [...segsByLine.entries()].map(([name, segs]) => {
      const coords = chainSegments(segs);
      const cumLengths = [0];
      for (let i = 1; i < coords.length; i++) {
        cumLengths.push(cumLengths[i - 1] + ptDist(coords[i - 1], coords[i]));
      }
      return [name, { coords, cumLengths }];
    }),
  );

  return lineGeometries;
}

function buildStationFractions(): Map<string, number> {
  if (stationFractions) return stationFractions;

  stationFractions = new Map();
  for (const [, stations] of Object.entries(stationData as Record<string, StationEntry[]>)) {
    for (const s of stations) {
      stationFractions.set(s.id, s.fraction);
    }
  }

  return stationFractions;
}

export function getLineGeometry(lineName: string): LineGeometry | undefined {
  return buildLineGeometries().get(lineName);
}

export function coordAtFraction(geo: LineGeometry, frac: number): [number, number] {
  const totalLen = geo.cumLengths[geo.cumLengths.length - 1];
  if (totalLen === 0) return geo.coords[0] ?? [139.7671, 35.6812];

  const targetLen = frac * totalLen;
  let lo = 0;
  let hi = geo.cumLengths.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (geo.cumLengths[mid] <= targetLen) lo = mid;
    else hi = mid;
  }

  const segStart = geo.cumLengths[lo];
  const segEnd = geo.cumLengths[hi];
  const segLen = segEnd - segStart;
  const t = segLen > 0 ? (targetLen - segStart) / segLen : 0;

  const a = geo.coords[lo];
  const b = geo.coords[hi];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function coordsBetweenFractions(
  geo: LineGeometry,
  startFrac: number,
  endFrac: number,
): [number, number][] {
  if (startFrac >= endFrac) return [coordAtFraction(geo, startFrac)];

  const totalLen = geo.cumLengths[geo.cumLengths.length - 1];
  if (totalLen === 0) return [geo.coords[0] ?? [139.7671, 35.6812]];

  const startLen = startFrac * totalLen;
  const endLen = endFrac * totalLen;

  const result: [number, number][] = [coordAtFraction(geo, startFrac)];

  for (let i = 0; i < geo.coords.length; i++) {
    if (geo.cumLengths[i] > startLen && geo.cumLengths[i] < endLen) {
      result.push(geo.coords[i]);
    }
  }

  result.push(coordAtFraction(geo, endFrac));
  return result;
}

function resolveStationFraction(stationId: string, railway: string): number | undefined {
  const fractions = buildStationFractions();

  const fullId = `${railway}.${stationId.split(".").pop()}`;
  const direct = fractions.get(fullId);
  if (direct !== undefined) return direct;

  const suffixMatch = stationId.includes(".") ? stationId : `${railway}.${stationId}`;
  return fractions.get(suffixMatch);
}

export function convertTrains(odptTrains: OdptTrain[]): TrainPosition[] {
  const geos = buildLineGeometries();
  const lineCounters = new Map<string, number>();

  return odptTrains.flatMap((train) => {
    const lineName = RAILWAY_TO_LINE[train.railway];
    if (!lineName) return [];

    const geo = geos.get(lineName);
    if (!geo || geo.coords.length === 0) return [];

    const count = lineCounters.get(lineName) ?? 0;
    lineCounters.set(lineName, count + 1);

    let progress: number;

    if (train.progress !== undefined) {
      progress = train.progress;
    } else {
      const fromFrac = resolveStationFraction(train.fromStation, train.railway);
      const toFrac = train.toStation
        ? resolveStationFraction(train.toStation, train.railway)
        : undefined;

      if (fromFrac !== undefined && toFrac !== undefined) {
        progress = (fromFrac + toFrac) / 2;
      } else if (fromFrac !== undefined) {
        const jitter = ((count * 0.037) % 0.12) - 0.06;
        progress = fromFrac + jitter;
      } else {
        const stationsForLine = (stationData as Record<string, StationEntry[]>)[train.railway];
        if (stationsForLine && stationsForLine.length > 1) {
          const minF = stationsForLine[0].fraction;
          const maxF = stationsForLine[stationsForLine.length - 1].fraction;
          const range = maxF - minF;
          const total = odptTrains.filter((t) => t.railway === train.railway).length;
          progress = range > 0 ? minF + (count / Math.max(total - 1, 1)) * range : minF;
        } else {
          const idx = (((count * 137) % geo.coords.length) + geo.coords.length) % geo.coords.length;
          progress = idx / geo.coords.length;
        }
      }
    }

    progress = Math.max(0, Math.min(1, progress));
    const coordinates = coordAtFraction(geo, progress);

    return [
      {
        coordinates,
        progress,
        line: lineName,
        color: LINE_COLORS[lineName] ?? RAILWAY_COLOR,
        instrument: LINE_INSTRUMENTS[lineName] ?? "percussion",
      },
    ];
  });
}
