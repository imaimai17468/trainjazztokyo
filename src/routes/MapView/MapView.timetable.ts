import { LINE_COLORS, RAILWAY_COLOR } from "./MapView.lines";

export type Instrument =
  | "bass"
  | "piano"
  | "vibraphone"
  | "trombone"
  | "saxophone"
  | "celesta"
  | "maracas"
  | "hihat"
  | "guitar"
  | "rimshot"
  | "percussion";

const LINE_INSTRUMENTS: Record<string, Instrument> = {
  山手線: "bass",
  中央線快速: "bass",
  京浜東北線: "bass",
  "中央・総武緩行線": "bass",
  東京メトロ銀座線: "piano",
  東京メトロ丸ノ内線: "piano",
  東京メトロ日比谷線: "piano",
  東京メトロ東西線: "vibraphone",
  都営浅草線: "trombone",
  都営新宿線: "trombone",
  都営大江戸線: "trombone",
  東京メトロ千代田線: "saxophone",
  東京メトロ有楽町線: "saxophone",
  東京メトロ半蔵門線: "saxophone",
  東京メトロ南北線: "saxophone",
  東京メトロ副都心線: "celesta",
  埼京線: "maracas",
  都営三田線: "hihat",
  東急東横線: "guitar",
  東急田園都市線: "guitar",
  小田急小田原線: "guitar",
  京王線: "guitar",
  湘南新宿ライン: "rimshot",
  上野東京ライン: "hihat",
};

export type DepartureEvent = {
  stationName: string;
  line: string;
  coordinates: [number, number];
  color: string;
  instrument: Instrument;
};

export function getDepartures(
  stations: { name: string; lines: string[]; coordinates: [number, number] }[],
): DepartureEvent[] {
  const departures: DepartureEvent[] = [];

  for (const station of stations) {
    if (Math.random() > 0.003) continue;

    const line = station.lines[Math.floor(Math.random() * station.lines.length)];
    departures.push({
      stationName: station.name,
      line,
      coordinates: station.coordinates,
      color: LINE_COLORS[line] ?? RAILWAY_COLOR,
      instrument: LINE_INSTRUMENTS[line] ?? "percussion",
    });
  }

  return departures;
}
