export const LINE_COLORS: Record<string, string> = {
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

// Headway in seconds by line and time period
type Period = "peak" | "day" | "evening" | "night";

const HEADWAYS: Record<string, Record<Period, number>> = {
  山手線: { peak: 120, day: 180, evening: 210, night: 300 },
  中央線快速: { peak: 120, day: 240, evening: 240, night: 360 },
  "中央・総武緩行線": { peak: 150, day: 240, evening: 240, night: 360 },
  京浜東北線: { peak: 150, day: 240, evening: 240, night: 360 },
  埼京線: { peak: 180, day: 300, evening: 300, night: 420 },
  湘南新宿ライン: { peak: 300, day: 600, evening: 600, night: 900 },
  上野東京ライン: { peak: 300, day: 600, evening: 600, night: 900 },
  東京メトロ銀座線: { peak: 120, day: 210, evening: 240, night: 360 },
  東京メトロ丸ノ内線: { peak: 120, day: 210, evening: 240, night: 360 },
  東京メトロ日比谷線: { peak: 135, day: 240, evening: 240, night: 360 },
  東京メトロ東西線: { peak: 120, day: 240, evening: 240, night: 360 },
  東京メトロ千代田線: { peak: 135, day: 240, evening: 240, night: 360 },
  東京メトロ有楽町線: { peak: 150, day: 270, evening: 300, night: 420 },
  東京メトロ半蔵門線: { peak: 150, day: 270, evening: 300, night: 420 },
  東京メトロ南北線: { peak: 180, day: 300, evening: 300, night: 420 },
  東京メトロ副都心線: { peak: 180, day: 300, evening: 300, night: 420 },
  都営浅草線: { peak: 180, day: 300, evening: 300, night: 420 },
  都営三田線: { peak: 180, day: 300, evening: 300, night: 420 },
  都営新宿線: { peak: 180, day: 300, evening: 300, night: 420 },
  都営大江戸線: { peak: 240, day: 300, evening: 300, night: 420 },
  東急東横線: { peak: 150, day: 270, evening: 300, night: 420 },
  東急田園都市線: { peak: 150, day: 270, evening: 300, night: 420 },
  小田急小田原線: { peak: 180, day: 300, evening: 300, night: 420 },
  京王線: { peak: 180, day: 300, evening: 300, night: 420 },
};

const DEFAULT_HEADWAY: Record<Period, number> = { peak: 180, day: 300, evening: 300, night: 420 };

function getPeriod(hour: number): Period {
  if (hour >= 7 && hour < 10) return "peak";
  if (hour >= 17 && hour < 20) return "peak";
  if (hour >= 10 && hour < 17) return "day";
  if (hour >= 20 && hour < 23) return "evening";
  return "night";
}

function isOperating(hour: number): boolean {
  return hour >= 5 || hour < 1;
}

// Deterministic hash for station offset
function stationHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export type DepartureEvent = {
  stationName: string;
  lines: string[];
  coordinates: [number, number];
  color: string;
};

export function getDepartures(
  stations: { name: string; lines: string[]; coordinates: [number, number] }[],
  now: Date,
): DepartureEvent[] {
  const hour = now.getHours();
  if (!isOperating(hour)) return [];

  const period = getPeriod(hour);
  const totalSeconds = hour * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const departures: DepartureEvent[] = [];

  for (const station of stations) {
    for (const line of station.lines) {
      const headway = (HEADWAYS[line] ?? DEFAULT_HEADWAY)[period];
      const offset = stationHash(station.name + line) % headway;
      const secondsInCycle = (totalSeconds - offset + headway * 1000) % headway;

      // Fire if within 1 second of departure
      if (secondsInCycle < 1) {
        departures.push({
          stationName: station.name,
          lines: station.lines,
          coordinates: station.coordinates,
          color: LINE_COLORS[line] ?? "#9ca3af",
        });
        break; // One departure per station per tick
      }
    }
  }

  return departures;
}
