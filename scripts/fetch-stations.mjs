import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.ODPT_API_KEY;
if (!API_KEY) {
  console.error("Set ODPT_API_KEY env var");
  process.exit(1);
}

const BASE = "https://api.odpt.org/api/v4";

const RAILWAY_MAP = {
  山手線: "JR-East.Yamanote",
  中央線快速: "JR-East.ChuoRapid",
  "中央・総武緩行線": "JR-East.ChuoSobuLocal",
  京浜東北線: "JR-East.KeihinTohoku",
  埼京線: "JR-East.Saikyo",
  湘南新宿ライン: "JR-East.ShonanShinjuku",
  上野東京ライン: "JR-East.UenoTokyo",
  東京メトロ銀座線: "TokyoMetro.Ginza",
  東京メトロ丸ノ内線: "TokyoMetro.Marunouchi",
  東京メトロ日比谷線: "TokyoMetro.Hibiya",
  東京メトロ東西線: "TokyoMetro.Tozai",
  東京メトロ千代田線: "TokyoMetro.Chiyoda",
  東京メトロ有楽町線: "TokyoMetro.Yurakucho",
  東京メトロ半蔵門線: "TokyoMetro.Hanzomon",
  東京メトロ南北線: "TokyoMetro.Namboku",
  東京メトロ副都心線: "TokyoMetro.Fukutoshin",
  都営浅草線: "Toei.Asakusa",
  都営三田線: "Toei.Mita",
  都営新宿線: "Toei.Shinjuku",
  都営大江戸線: "Toei.Oedo",
  東急東横線: "Tokyu.Toyoko",
  東急田園都市線: "Tokyu.DenEnToshi",
  小田急小田原線: "Odakyu.Odawara",
  京王線: "Keio.Keio",
};

function strip(prefix, val) {
  return val.replace(prefix, "");
}

async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${resp.status} ${url}`);
  return resp.json();
}

function dist(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function cumulativeLength(coords) {
  const lengths = [0];
  for (let i = 1; i < coords.length; i++) {
    lengths.push(lengths[i - 1] + dist(coords[i - 1], coords[i]));
  }
  return lengths;
}

function nearestFractionOnLine(point, lineCoords, lineLengths) {
  const totalLen = lineLengths[lineLengths.length - 1];
  if (totalLen === 0) return 0;

  let bestDist = Infinity;
  let bestFrac = 0;

  for (let i = 0; i < lineCoords.length - 1; i++) {
    const a = lineCoords[i];
    const b = lineCoords[i + 1];
    const segLen = dist(a, b);
    if (segLen === 0) continue;

    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    let t = ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (segLen * segLen);
    t = Math.max(0, Math.min(1, t));

    const proj = [a[0] + t * dx, a[1] + t * dy];
    const d = dist(point, proj);

    if (d < bestDist) {
      bestDist = d;
      bestFrac = (lineLengths[i] + t * segLen) / totalLen;
    }
  }

  return bestFrac;
}

function extractOsmStations(elements) {
  const relations = elements.filter((e) => e.type === "relation");
  const nodesById = new Map();
  for (const e of elements) {
    if (e.type === "node" && "lat" in e && "lon" in e) {
      nodesById.set(e.id, { lon: e.lon, lat: e.lat, name: e.tags?.name });
    }
  }

  const stopIds = [];
  const seen = new Set();
  for (const rel of relations) {
    const name = rel.tags?.name ?? "";
    if (name.includes("直通") || name.includes("アクセス")) continue;
    for (const m of rel.members ?? []) {
      if (m.role === "stop" && !seen.has(m.ref)) {
        seen.add(m.ref);
        stopIds.push(m.ref);
      }
    }
  }

  const stations = [];
  for (const id of stopIds) {
    const node = nodesById.get(id);
    if (node?.name) {
      stations.push({
        name: node.name,
        coords: [node.lon, node.lat],
      });
    }
  }

  return stations;
}

function chainCoords(features) {
  const segs = features.map((f) => [...f.geometry.coordinates]);
  const chains = [];
  const threshold = 0.005;

  while (segs.length > 0) {
    const chain = segs.shift();
    let changed = true;
    while (changed && segs.length > 0) {
      changed = false;
      let bestIdx = -1;
      let bestDist = threshold;
      let bestType = -1;

      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        const dists = [
          dist(chain[chain.length - 1], seg[0]),
          dist(chain[chain.length - 1], seg[seg.length - 1]),
          dist(chain[0], seg[seg.length - 1]),
          dist(chain[0], seg[0]),
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
      const seg = segs.splice(bestIdx, 1)[0];
      if (bestType === 0) chain.push(...seg.slice(1));
      else if (bestType === 1) chain.push(...seg.toReversed().slice(1));
      else if (bestType === 2) chain.unshift(...seg.slice(0, -1));
      else chain.unshift(...seg.toReversed().slice(0, -1));
      changed = true;
    }
    chains.push(chain);
  }

  const longest = chains.reduce(
    (best, c) => {
      const len = cumulativeLength(c).pop();
      return len > best.len ? { chain: c, len } : best;
    },
    { chain: [], len: 0 },
  );

  return longest.chain;
}

async function main() {
  const rawPath = resolve(__dirname, "raw-railway.json");
  const geojsonPath = resolve(__dirname, "../src/routes/MapView/tokyo-railway.json");
  const outPath = resolve(__dirname, "../src/routes/MapView/tokyo-stations.json");

  const rawData = JSON.parse(readFileSync(rawPath, "utf-8"));
  const geojson = JSON.parse(readFileSync(geojsonPath, "utf-8"));

  const featuresByLine = new Map();
  for (const f of geojson.lines.features) {
    const name = f.properties.line;
    if (!featuresByLine.has(name)) featuresByLine.set(name, []);
    featuresByLine.get(name).push(f);
  }

  const odptStations = new Map();
  const odptStationOrder = new Map();

  const OPERATORS = ["TokyoMetro", "Toei", "JR-East", "Tokyu", "Odakyu", "Keio"];
  for (const op of OPERATORS) {
    console.log(`Fetching ODPT stations for ${op}...`);
    const data = await fetchJSON(
      `${BASE}/odpt:Station?odpt:operator=odpt.Operator:${op}&acl:consumerKey=${API_KEY}`,
    );
    for (const s of data) {
      const id = strip("odpt.Station:", s["owl:sameAs"]);
      const railway = strip("odpt.Railway:", s["odpt:railway"]);
      const jaName = s["dc:title"];
      const enName = s["odpt:stationTitle"]?.en;
      odptStations.set(id, {
        railway,
        name: jaName,
        en: enName,
        coords: s["geo:lat"] != null ? [s["geo:long"], s["geo:lat"]] : undefined,
      });
    }

    for (const railwayId of Object.values(RAILWAY_MAP)) {
      if (!railwayId.startsWith(op)) continue;
      try {
        const railData = await fetchJSON(
          `${BASE}/odpt:Railway?owl:sameAs=odpt.Railway:${railwayId}&acl:consumerKey=${API_KEY}`,
        );
        const order = railData[0]?.["odpt:stationOrder"];
        if (order?.length > 0) {
          odptStationOrder.set(
            railwayId,
            order
              .toSorted((a, b) => a["odpt:index"] - b["odpt:index"])
              .map((s) => strip("odpt.Station:", s["odpt:station"])),
          );
        }
      } catch {
        /* ignore */
      }
    }
  }

  const result = {};

  for (const [lineName, railwayId] of Object.entries(RAILWAY_MAP)) {
    console.log(`\nProcessing ${lineName} (${railwayId})...`);

    const features = featuresByLine.get(lineName);
    if (!features) {
      console.log(`  No GeoJSON features found`);
      continue;
    }

    const chain = chainCoords(features);
    const lengths = cumulativeLength(chain);

    const osmStations = rawData[lineName] ? extractOsmStations(rawData[lineName]) : [];

    const odptOrder = odptStationOrder.get(railwayId);

    const stations = [];

    if (odptOrder && odptOrder.length > 0) {
      for (const stationId of odptOrder) {
        const odptInfo = odptStations.get(stationId);
        if (!odptInfo) continue;

        let coords = odptInfo.coords;
        if (!coords) {
          const osmMatch = osmStations.find((s) => s.name === odptInfo.name);
          if (osmMatch) coords = osmMatch.coords;
        }

        if (coords) {
          const frac = nearestFractionOnLine(coords, chain, lengths);
          stations.push({
            id: stationId,
            name: odptInfo.name,
            fraction: Math.round(frac * 10000) / 10000,
          });
        }
      }
    } else {
      const odptStationsForLine = [];
      for (const [id, info] of odptStations) {
        if (info.railway === railwayId) {
          odptStationsForLine.push({ id, ...info });
        }
      }

      const matchedStations = [];
      for (const odptSt of odptStationsForLine) {
        let coords = odptSt.coords;
        if (!coords) {
          const osmMatch = osmStations.find((s) => s.name === odptSt.name);
          if (osmMatch) coords = osmMatch.coords;
        }
        if (coords) {
          const frac = nearestFractionOnLine(coords, chain, lengths);
          matchedStations.push({
            id: odptSt.id,
            name: odptSt.name,
            fraction: Math.round(frac * 10000) / 10000,
          });
        }
      }

      matchedStations.sort((a, b) => a.fraction - b.fraction);

      if (matchedStations.length > 0) {
        stations.push(...matchedStations);
      } else {
        for (const osmSt of osmStations) {
          const frac = nearestFractionOnLine(osmSt.coords, chain, lengths);
          stations.push({
            id: `${railwayId}.${osmSt.name}`,
            name: osmSt.name,
            fraction: Math.round(frac * 10000) / 10000,
          });
        }
        stations.sort((a, b) => a.fraction - b.fraction);
      }
    }

    console.log(`  ${stations.length} stations mapped`);
    result[railwayId] = stations;
  }

  writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");
  console.log(`\nWrote to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
