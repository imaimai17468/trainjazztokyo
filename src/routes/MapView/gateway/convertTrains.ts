import type { OdptTrain } from "../entity/odpt";
import type { TrainPosition } from "../entity/train";
import { LINE_COLORS, LINE_INSTRUMENTS, RAILWAY_COLOR } from "../MapView.lines";
import railwayData from "../tokyo-railway.json";

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

type LineGeometry = {
  coords: [number, number][];
};

let lineGeometries: Map<string, LineGeometry> | undefined;

function getLineGeometries(): Map<string, LineGeometry> {
  if (lineGeometries) return lineGeometries;

  const grouped = railwayData.lines.features.reduce((acc, f) => {
    const name = f.properties.line as string;
    const coords = f.geometry.coordinates as [number, number][];
    return acc.set(name, [...(acc.get(name) ?? []), ...coords]);
  }, new Map<string, [number, number][]>());

  lineGeometries = new Map([...grouped.entries()].map(([name, coords]) => [name, { coords }]));

  return lineGeometries;
}

function pickPositionOnLine(lineName: string, trainIndex: number): [number, number] {
  const geo = getLineGeometries().get(lineName);
  if (!geo || geo.coords.length === 0) return [139.7671, 35.6812];

  const idx = (((trainIndex * 137) % geo.coords.length) + geo.coords.length) % geo.coords.length;
  return geo.coords[idx];
}

export function convertTrains(odptTrains: OdptTrain[]): TrainPosition[] {
  const lineCounters = new Map<string, number>();

  return odptTrains.reduce<TrainPosition[]>((positions, train) => {
    const lineName = RAILWAY_TO_LINE[train.railway];
    if (!lineName) return positions;

    const count = lineCounters.get(lineName) ?? 0;
    lineCounters.set(lineName, count + 1);

    return [
      ...positions,
      {
        coordinates: pickPositionOnLine(lineName, count),
        line: lineName,
        color: LINE_COLORS[lineName] ?? RAILWAY_COLOR,
        instrument: LINE_INSTRUMENTS[lineName] ?? "percussion",
      },
    ];
  }, []);
}
