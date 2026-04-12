#!/usr/bin/env python3
"""Fetch Tokyo 24 railway lines from Overpass API and save raw data."""

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
BBOX = "35.3,139.2,36.6,140.4"
OUT = Path("scripts/raw-railway.json")
CONCURRENCY = 3
RETRIES = 5
TIMEOUT = 60

# (search_name, output_name) — search_name is regex matched against relation name
LINES = [
    ("山手線", "山手線"),
    ("中央線快速", "中央線快速"),
    ("中央・総武緩行線", "中央・総武緩行線"),
    ("京浜東北線", "京浜東北線"),
    ("埼京線", "埼京線"),
    ("湘南新宿ライン", "湘南新宿ライン"),
    ("上野東京ライン", "上野東京ライン"),
    ("東京メトロ銀座線", "東京メトロ銀座線"),
    ("東京メトロ丸ノ内線", "東京メトロ丸ノ内線"),
    ("東京メトロ日比谷線", "東京メトロ日比谷線"),
    ("東京メトロ東西線", "東京メトロ東西線"),
    ("千代田線", "東京メトロ千代田線"),
    ("東京メトロ有楽町線", "東京メトロ有楽町線"),
    ("東京メトロ半蔵門線", "東京メトロ半蔵門線"),
    ("東京メトロ南北線", "東京メトロ南北線"),
    ("東京メトロ副都心線", "東京メトロ副都心線"),
    ("都営浅草線", "都営浅草線"),
    ("都営三田線", "都営三田線"),
    ("都営新宿線", "都営新宿線"),
    ("都営大江戸線", "都営大江戸線"),
    ("東急東横線", "東急東横線"),
    ("東急田園都市線", "東急田園都市線"),
    ("小田急電鉄小田原線", "小田急小田原線"),
    ("京王線", "京王線"),
]


def query_for(search_name: str) -> str:
    return (
        f'[out:json][timeout:{TIMEOUT}];'
        f'relation["route"~"train|subway"]["name"~"{search_name}"]({BBOX})->.rels;'
        f'.rels out body;'
        f'.rels >;'
        f'out skel qt;'
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


async def main():
    sem = asyncio.Semaphore(CONCURRENCY)
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, search, sem) for search, _out in LINES]
        results = await asyncio.gather(*tasks)

    raw = {}
    failed = []
    for (search, out_name), (_, elements) in zip(LINES, results):
        if not elements:
            failed.append(out_name)
            continue
        raw[out_name] = elements
        print(f"  {out_name}: {len(elements)} elements")

    OUT.write_text(json.dumps(raw, ensure_ascii=False), encoding="utf-8")
    size_mb = OUT.stat().st_size / 1024 / 1024
    print(f"\n{len(raw)}/{len(LINES)} lines fetched, {size_mb:.1f} MB → {OUT}")

    if failed:
        print(f"\nFailed ({len(failed)}): {', '.join(failed)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
