import type { APIEvent } from "@solidjs/start/server";

const ODPT_API_BASE = "https://api.odpt.org/api/v4";

export async function GET(_event: APIEvent) {
  const apiKey = import.meta.env.VITE_ODPT_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = `${ODPT_API_BASE}/odpt:Train?acl:consumerKey=${apiKey}`;
  const resp = await fetch(url);
  const raw = (await resp.json()) as Record<string, unknown>[];

  const trains = raw.map((t) => ({
    railway: String(t["odpt:railway"] ?? "").replace("odpt.Railway:", ""),
    fromStation: String(t["odpt:fromStation"] ?? "").replace("odpt.Station:", ""),
    toStation: t["odpt:toStation"]
      ? String(t["odpt:toStation"]).replace("odpt.Station:", "")
      : undefined,
    railDirection: String(t["odpt:railDirection"] ?? "").replace("odpt.RailDirection:", ""),
    trainNumber: String(t["odpt:trainNumber"] ?? ""),
    date: String(t["dc:date"] ?? ""),
  }));

  return new Response(JSON.stringify(trains), {
    headers: { "Content-Type": "application/json" },
  });
}
