import { createFileRoute } from "@tanstack/react-router";
import { generateSimulatedTrains } from "./-simulate";

const ODPT_API_BASE = "https://api.odpt.org/api/v4";
const CACHE_TTL = 30_000;

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
];

type NormalizedTrain = {
  railway: string;
  fromStation: string;
  toStation?: string;
  railDirection: string;
  trainNumber: string;
  departureTime?: string;
  progress?: number;
  date: string;
};

let cachedOdpt: { data: NormalizedTrain[]; time: number } | undefined;
let fetchingPromise: Promise<NormalizedTrain[]> | undefined;

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
            departureTime: depTime,
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

async function fetchOdptTrains(apiKey: string): Promise<NormalizedTrain[]> {
  const [realtime, timetable] = await Promise.all([
    fetchRealtimeTrains(apiKey),
    fetchTimetableTrains(apiKey),
  ]);

  const realtimeRailways = new Set(realtime.map((t) => t.railway));
  const timetableFiltered = timetable.filter((t) => !realtimeRailways.has(t.railway));

  return [...realtime, ...timetableFiltered];
}

async function getOdptTrains(apiKey: string): Promise<NormalizedTrain[]> {
  if (cachedOdpt && Date.now() - cachedOdpt.time < CACHE_TTL) {
    return cachedOdpt.data;
  }

  if (fetchingPromise) return fetchingPromise;

  fetchingPromise = fetchOdptTrains(apiKey)
    .then((data) => {
      cachedOdpt = { data, time: Date.now() };
      return data;
    })
    .finally(() => {
      fetchingPromise = undefined;
    });

  if (cachedOdpt) return cachedOdpt.data;

  return fetchingPromise;
}

export const Route = createFileRoute("/api/trains")({
  server: {
    handlers: {
      GET: async () => {
        const apiKey = import.meta.env.VITE_ODPT_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" },
          });
        }

        const odptTrains = await getOdptTrains(apiKey);

        const coveredRailways = new Set(odptTrains.map((t) => t.railway));
        const simulated = generateSimulatedTrains(coveredRailways);

        const all = [...odptTrains, ...simulated];

        return new Response(JSON.stringify(all), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
