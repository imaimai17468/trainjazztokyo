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

const LINE_COLORS: Record<string, string> = {
  山手線: "#9acd32",
  中央線快速: "#f15a22",
  "中央・総武緩行線": "#ffd400",
  京浜東北線: "#00b2e5",
  埼京線: "#00ac9b",
  湘南新宿ライン: "#e85298",
  上野東京ライン: "#f15a22",
  東京メトロ銀座線: "#f39700",
  東京メトロ丸ノ内線: "#e60012",
  東京メトロ日比谷線: "#9caeb7",
  東京メトロ東西線: "#00a7db",
  東京メトロ千代田線: "#00a650",
  東京メトロ有楽町線: "#c1a470",
  東京メトロ半蔵門線: "#8b76d0",
  東京メトロ南北線: "#00ada9",
  東京メトロ副都心線: "#9c5e31",
  都営浅草線: "#e85298",
  都営三田線: "#0079c2",
  都営新宿線: "#6cbb5a",
  都営大江戸線: "#b6007a",
  東急東横線: "#da0442",
  東急田園都市線: "#009944",
  小田急小田原線: "#1e90ff",
  京王線: "#dd0077",
};

export type DepartureEvent = {
  stationName: string;
  line: string;
  lines: string[];
  coordinates: [number, number];
  color: string;
  instrument: Instrument;
};

export function getDepartures(
  stations: { name: string; lines: string[]; coordinates: [number, number] }[],
  _now: Date,
): DepartureEvent[] {
  const departures: DepartureEvent[] = [];

  for (const station of stations) {
    // ~0.3% chance per 100ms tick ≈ one fire every ~3s per station
    if (Math.random() > 0.003) continue;

    const line = station.lines[Math.floor(Math.random() * station.lines.length)];
    departures.push({
      stationName: station.name,
      line,
      lines: station.lines,
      coordinates: station.coordinates,
      color: LINE_COLORS[line] ?? "#9ca3af",
      instrument: LINE_INSTRUMENTS[line] ?? "percussion",
    });
  }

  return departures;
}
