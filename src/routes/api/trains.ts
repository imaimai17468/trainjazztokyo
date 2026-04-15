import type { APIEvent } from "@solidjs/start/server";

const ODPT_API_BASE = "https://api.odpt.org/api/v4";

const TIMETABLE_RAILWAYS = [
  "odpt.Railway:TokyoMetro.Ginza",
  "odpt.Railway:TokyoMetro.Marunouchi",
  "odpt.Railway:TokyoMetro.Hibiya",
  "odpt.Railway:TokyoMetro.Tozai",
  "odpt.Railway:TokyoMetro.Chiyoda",
  "odpt.Railway:TokyoMetro.Yurakucho",
  "odpt.Railway:TokyoMetro.Hanzomon",
  "odpt.Railway:TokyoMetro.Namboku",
  "odpt.Railway:TokyoMetro.Fukutoshin",
  "odpt.Railway:JR-East.Yamanote",
  "odpt.Railway:JR-East.ChuoRapid",
  "odpt.Railway:JR-East.ChuoSobuLocal",
  "odpt.Railway:JR-East.KeihinTohoku",
  "odpt.Railway:JR-East.Saikyo",
  "odpt.Railway:JR-East.ShonanShinjuku",
  "odpt.Railway:JR-East.UenoTokyo",
  "odpt.Railway:Tokyu.Toyoko",
  "odpt.Railway:Tokyu.DenEnToshi",
  "odpt.Railway:Odakyu.Odawara",
  "odpt.Railway:Keio.Keio",
];

type NormalizedTrain = {
  railway: string;
  fromStation: string;
  toStation?: string;
  railDirection: string;
  trainNumber: string;
  date: string;
};

function strip(prefix: string, val: string): string {
  return val.replace(prefix, "");
}

function nowTimeStr(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getCalendarType(): string {
  const day = new Date().getDay();
  if (day === 0) return "Holiday";
  if (day === 6) return "Saturday";
  return "Weekday";
}

async function fetchRealtimeTrains(apiKey: string): Promise<NormalizedTrain[]> {
  const url = `${ODPT_API_BASE}/odpt:Train?acl:consumerKey=${apiKey}`;
  const resp = await fetch(url);
  const raw = (await resp.json()) as Record<string, unknown>[];

  return raw.map((t) => ({
    railway: strip("odpt.Railway:", String(t["odpt:railway"] ?? "")),
    fromStation: strip("odpt.Station:", String(t["odpt:fromStation"] ?? "")),
    toStation: t["odpt:toStation"]
      ? strip("odpt.Station:", String(t["odpt:toStation"]))
      : undefined,
    railDirection: strip("odpt.RailDirection:", String(t["odpt:railDirection"] ?? "")),
    trainNumber: String(t["odpt:trainNumber"] ?? ""),
    date: String(t["dc:date"] ?? ""),
  }));
}

async function fetchTimetableTrains(apiKey: string): Promise<NormalizedTrain[]> {
  const calType = getCalendarType();
  const currentTime = nowTimeStr();
  const currentMin = timeToMinutes(currentTime);
  const windowMin = 5;

  const results: NormalizedTrain[] = [];

  const fetches = TIMETABLE_RAILWAYS.map(async (railway) => {
    const railwayShort = strip("odpt.Railway:", railway);

    const url =
      `${ODPT_API_BASE}/odpt:StationTimetable?acl:consumerKey=${apiKey}` +
      `&odpt:railway=${railway}`;
    const resp = await fetch(url);
    const timetables = (await resp.json()) as Record<string, unknown>[];

    const trains: NormalizedTrain[] = [];
    const seen = new Set<string>();

    timetables
      .filter((tt) => {
        const cal = String(tt["odpt:calendar"] ?? "");
        return cal.includes(calType);
      })
      .forEach((tt) => {
        const station = strip("odpt.Station:", String(tt["odpt:station"] ?? ""));
        const direction = strip("odpt.RailDirection:", String(tt["odpt:railDirection"] ?? ""));
        const objects = (tt["odpt:stationTimetableObject"] ?? []) as Record<string, unknown>[];

        objects.forEach((obj) => {
          const depTime = String(obj["odpt:departureTime"] ?? obj["odpt:arrivalTime"] ?? "");
          if (!depTime) return;

          const depMin = timeToMinutes(depTime);
          if (Math.abs(depMin - currentMin) > windowMin) return;

          const trainNum = String(obj["odpt:trainNumber"] ?? `${depTime}-${station}`);
          const key = `${railwayShort}-${trainNum}`;
          if (seen.has(key)) return;
          seen.add(key);

          trains.push({
            railway: railwayShort,
            fromStation: station,
            toStation: undefined,
            railDirection: direction,
            trainNumber: trainNum,
            date: new Date().toISOString(),
          });
        });
      });

    return trains;
  });

  const allTrains = await Promise.all(fetches);
  allTrains.forEach((trains) => results.push(...trains));

  return results;
}

export async function GET(_event: APIEvent) {
  const apiKey = import.meta.env.VITE_ODPT_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const [realtime, timetable] = await Promise.all([
    fetchRealtimeTrains(apiKey),
    fetchTimetableTrains(apiKey),
  ]);

  const realtimeRailways = new Set(realtime.map((t) => t.railway));
  const timetableFiltered = timetable.filter((t) => !realtimeRailways.has(t.railway));

  const all = [...realtime, ...timetableFiltered];

  return new Response(JSON.stringify(all), {
    headers: { "Content-Type": "application/json" },
  });
}
