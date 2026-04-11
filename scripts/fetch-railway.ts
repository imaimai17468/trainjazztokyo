import { writeFileSync, existsSync, readFileSync } from "node:fs";

const OVERPASS_ENDPOINTS = [
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const BBOX = "35.53,139.56,35.82,139.92";
const CACHE_PATH = "src/routes/MapView/tokyo-railway.json";

const LINES = [
  "山手線",
  "中央線快速",
  "中央・総武緩行線",
  "京浜東北線",
  "埼京線",
  "湘南新宿ライン",
  "上野東京ライン",
  "東京メトロ銀座線",
  "東京メトロ丸ノ内線",
  "東京メトロ日比谷線",
  "東京メトロ東西線",
  "東京メトロ千代田線",
  "東京メトロ有楽町線",
  "東京メトロ半蔵門線",
  "東京メトロ南北線",
  "東京メトロ副都心線",
  "都営浅草線",
  "都営三田線",
  "都営新宿線",
  "都営大江戸線",
  "東急東横線",
  "東急田園都市線",
  "小田急小田原線",
  "京王線",
];

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  nodes?: number[];
  members?: { type: string; ref: number; role: string }[];
};

type GeoJSONFeature = {
  type: "Feature";
  properties: Record<string, string>;
  geometry: {
    type: "LineString" | "Point";
    coordinates: number[][] | number[];
  };
};

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(query: string, retries = 3): Promise<OverpassElement[]> {
  for (let i = 0; i < retries; i++) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      if (i > 0) {
        const wait = 3000 * i;
        console.log(
          `    Retry ${i}/${retries} (${endpoint.split("//")[1].split("/")[0]}) after ${wait / 1000}s...`,
        );
        await sleep(wait);
      }
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          signal: AbortSignal.timeout(30000),
        });
        if (res.status === 429 || res.status === 504) continue;
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        return data.elements;
      } catch {
        continue;
      }
    }
  }
  throw new Error(`Failed after ${retries} retries on all endpoints`);
}

async function fetchLine(name: string): Promise<OverpassElement[]> {
  const query = `[out:json][timeout:60];
(
  relation["route"~"train|subway"]["name"~"${name}"](${BBOX});
);
out body;
>;
out skel qt;`;
  return fetchWithRetry(query);
}

async function fetchStations(): Promise<OverpassElement[]> {
  const query = `[out:json][timeout:60];
node["railway"="station"]["name"](${BBOX});
out body;`;
  return fetchWithRetry(query);
}

function buildLines(elements: OverpassElement[]): GeoJSONFeature[] {
  const nodeMap = new Map<number, [number, number]>();
  for (const el of elements) {
    if (el.type === "node" && el.lat != null && el.lon != null) {
      nodeMap.set(el.id, [el.lon, el.lat]);
    }
  }

  return elements
    .filter((el) => el.type === "way" && el.nodes)
    .map((el) => {
      const coords = el
        .nodes!.map((id) => nodeMap.get(id))
        .filter((c): c is [number, number] => c != null);
      return {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: coords },
      };
    });
}

function buildStations(elements: OverpassElement[]): GeoJSONFeature[] {
  return elements
    .filter((el) => el.type === "node" && el.tags?.railway === "station" && el.lat != null)
    .map((el) => ({
      type: "Feature" as const,
      properties: { name: el.tags?.name ?? "" },
      geometry: { type: "Point" as const, coordinates: [el.lon!, el.lat!] },
    }));
}

async function main() {
  // Load partial results if exist
  let existing:
    | { lines: { features: GeoJSONFeature[] }; stations: { features: GeoJSONFeature[] } }
    | undefined;
  if (existsSync(CACHE_PATH)) {
    existing = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  }

  console.log("Fetching 24 railway lines...");

  const allLineFeatures: GeoJSONFeature[] = [];

  for (const name of LINES) {
    console.log(`  Fetching: ${name}`);
    try {
      const elements = await fetchLine(name);
      const features = buildLines(elements);
      allLineFeatures.push(...features);
      console.log(`    → ${features.length} segments`);
    } catch (e) {
      console.error(`    ✗ Failed: ${e}`);
    }
    await sleep(3000);
  }

  console.log("Fetching stations...");
  let stationFeatures: GeoJSONFeature[];
  try {
    const stationElements = await fetchStations();
    stationFeatures = buildStations(stationElements);
    console.log(`  → ${stationFeatures.length} stations`);
  } catch (e) {
    console.error(`  ✗ Failed: ${e}`);
    stationFeatures = existing?.stations?.features ?? [];
    console.log(`  Using cached ${stationFeatures.length} stations`);
  }

  const result = {
    lines: { type: "FeatureCollection", features: allLineFeatures },
    stations: { type: "FeatureCollection", features: stationFeatures },
  };

  writeFileSync(CACHE_PATH, JSON.stringify(result));
  console.log(
    `\nWritten to ${CACHE_PATH} (${(JSON.stringify(result).length / 1024).toFixed(0)} KB)`,
  );
}

main();
