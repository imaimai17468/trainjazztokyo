#!/usr/bin/env python3
"""Fetch Tokyo 24 railway lines from Overpass API and output GeoJSON."""

import asyncio
import json
import sys
from pathlib import Path

try:
    import aiohttp
except ImportError:
    sys.exit("pip3 install aiohttp")

ENDPOINTS = [
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
BBOX = "35.53,139.56,35.82,139.92"
OUT = Path("src/routes/MapView/tokyo-railway.json")
CONCURRENCY = 3  # max parallel requests
RETRIES = 5
TIMEOUT = 60

LINES = [
    "山手線", "中央線快速", "中央・総武緩行線", "京浜東北線",
    "埼京線", "湘南新宿ライン", "上野東京ライン",
    "東京メトロ銀座線", "東京メトロ丸ノ内線", "東京メトロ日比谷線",
    "東京メトロ東西線", "東京メトロ千代田線", "東京メトロ有楽町線",
    "東京メトロ半蔵門線", "東京メトロ南北線", "東京メトロ副都心線",
    "都営浅草線", "都営三田線", "都営新宿線", "都営大江戸線",
    "東急東横線", "東急田園都市線", "小田急小田原線", "京王線",
]


def query_for(name: str) -> str:
    return (
        f'[out:json][timeout:{TIMEOUT}];'
        f'relation["route"~"train|subway"]["name"~"{name}"]({BBOX})->.rels;'
        f'.rels out body;'
        f'.rels >;'
        f'out skel qt;'
        f'node(r.rels:"stop")->.stops;'
        f'.stops out body;'
    )


async def fetch_one(session: aiohttp.ClientSession, name: str, sem: asyncio.Semaphore):
    query = query_for(name)
    for attempt in range(RETRIES):
        for ep in ENDPOINTS:
            async with sem:
                try:
                    async with session.post(
                        ep,
                        data=f"data={query}",
                        headers={"Content-Type": "application/x-www-form-urlencoded"},
                        timeout=aiohttp.ClientTimeout(total=TIMEOUT),
                    ) as resp:
                        if resp.status in (429, 504):
                            continue
                        if resp.status != 200:
                            continue
                        text = await resp.text()
                        if text.startswith("<?xml"):
                            continue
                        data = json.loads(text)
                        return name, data["elements"]
                except Exception:
                    pass
            await asyncio.sleep(1)
        wait = 3 * (attempt + 1)
        print(f"    {name}: retry {attempt+1}/{RETRIES} after {wait}s")
        await asyncio.sleep(wait)
    print(f"    ✗ {name}: failed after {RETRIES} retries")
    return name, []


def build(elements: list, line_name: str):
    nodes = {}
    for el in elements:
        if el["type"] == "node" and "lat" in el and "lon" in el:
            nodes[el["id"]] = (el["lon"], el["lat"])

    lines = []
    for el in elements:
        if el["type"] == "way" and "nodes" in el:
            coords = [nodes[n] for n in el["nodes"] if n in nodes]
            if coords:
                lines.append({
                    "type": "Feature",
                    "properties": {"line": line_name},
                    "geometry": {"type": "LineString", "coordinates": coords},
                })

    stations = []
    for el in elements:
        if el["type"] == "node" and el.get("tags", {}).get("name") and "lat" in el:
            stations.append({
                "type": "Feature",
                "properties": {"name": el["tags"]["name"], "lines": [line_name]},
                "geometry": {"type": "Point", "coordinates": [el["lon"], el["lat"]]},
            })

    return lines, stations


async def main():
    sem = asyncio.Semaphore(CONCURRENCY)
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, name, sem) for name in LINES]
        results = await asyncio.gather(*tasks)

    all_lines = []
    station_map: dict[str, dict] = {}

    for name, elements in results:
        if not elements:
            continue
        lines, stations = build(elements, name)
        all_lines.extend(lines)
        for s in stations:
            key = json.dumps(s["geometry"]["coordinates"])
            if key in station_map:
                station_map[key]["properties"]["lines"].append(name)
            else:
                station_map[key] = s
        print(f"  {name}: {len(lines)} segments, {len(stations)} stations")

    all_stations = list(station_map.values())
    failed = [name for name, el in results if not el]

    result = {
        "lines": {"type": "FeatureCollection", "features": all_lines},
        "stations": {"type": "FeatureCollection", "features": all_stations},
    }

    OUT.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    size_kb = OUT.stat().st_size / 1024
    print(f"\n{len(all_stations)} unique stations, {size_kb:.0f} KB → {OUT}")

    if failed:
        print(f"\nFailed ({len(failed)}): {', '.join(failed)}")
        print("Re-run to retry only failed lines.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
