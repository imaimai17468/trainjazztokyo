#!/usr/bin/env python3
"""Build tokyo-railway.json from raw Overpass data, filtered to Tokyo-to polygon."""

import json
import sys
import urllib.request
from pathlib import Path

RAW = Path("scripts/raw-railway.json")
BOUNDARY_CACHE = Path("scripts/tokyo-polygon.json")
OUT = Path("src/routes/MapView/tokyo-railway.json")


# ---------------------------------------------------------------------------
# Tokyo polygon
# ---------------------------------------------------------------------------

def fetch_tokyo_polygon() -> list[list[float]]:
    """Fetch Tokyo-to boundary from Overpass and return mainland ring."""
    print("Fetching Tokyo boundary from Overpass...")
    query = (
        '[out:json][timeout:60];'
        "relation['name'='東京都']['admin_level'='4'];"
        'out body;>;out skel qt;'
    )
    url = "https://lz4.overpass-api.de/api/interpreter"
    data = f"data={query}".encode()
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    resp = urllib.request.urlopen(req, timeout=60)
    result = json.loads(resp.read())

    nodes = {}
    ways = {}
    relation = None
    for el in result["elements"]:
        if el["type"] == "node":
            nodes[el["id"]] = [el["lon"], el["lat"]]
        elif el["type"] == "way":
            ways[el["id"]] = el.get("nodes", [])
        elif el["type"] == "relation":
            relation = el

    outer_refs = [
        m["ref"] for m in relation["members"]
        if m["type"] == "way" and m.get("role") == "outer"
    ]

    segments = []
    for ref in outer_refs:
        coords = [nodes[n] for n in ways.get(ref, []) if n in nodes]
        if coords:
            segments.append(coords)

    # Chain segments into rings
    rings = []
    while segments:
        ring = list(segments.pop(0))
        changed = True
        while changed:
            changed = False
            for i, seg in enumerate(segments):
                if ring[-1] == seg[0]:
                    ring.extend(seg[1:])
                elif ring[-1] == seg[-1]:
                    ring.extend(reversed(seg[:-1]))
                elif ring[0] == seg[-1]:
                    ring = seg[:-1] + ring
                elif ring[0] == seg[0]:
                    ring = list(reversed(seg[1:])) + ring
                else:
                    continue
                segments.pop(i)
                changed = True
                break
        rings.append(ring)

    # Find mainland ring (largest, lat ~35)
    mainland = max(
        (r for r in rings if any(35.0 < c[1] < 36.0 for c in r)),
        key=len,
    )
    return mainland


def get_tokyo_polygon() -> list[list[float]]:
    if BOUNDARY_CACHE.exists():
        with open(BOUNDARY_CACHE) as f:
            rings = json.load(f)
        mainland = max(
            (r for r in rings if any(35.0 < c[1] < 36.0 for c in r)),
            key=len,
        )
        print(f"Loaded cached Tokyo polygon ({len(mainland)} points)")
        return mainland

    mainland = fetch_tokyo_polygon()
    # Cache all rings
    BOUNDARY_CACHE.write_text(json.dumps([mainland]), encoding="utf-8")
    print(f"Fetched and cached Tokyo polygon ({len(mainland)} points)")
    return mainland


# ---------------------------------------------------------------------------
# Point-in-polygon (ray casting)
# ---------------------------------------------------------------------------

def point_in_polygon(lon: float, lat: float, polygon: list) -> bool:
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > lat) != (yj > lat)) and (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


# ---------------------------------------------------------------------------
# Build GeoJSON
# ---------------------------------------------------------------------------

def r5(v: float) -> float:
    return round(v, 5)


# Relation names that indicate through-service (直通運転), not the line itself
THROUGH_SERVICE_PATTERNS = ["直通", "アクセス"]


def is_own_relation(el: dict, line_name: str) -> bool:
    """Return True if this relation belongs to the line itself, not through-service."""
    name = el.get("tags", {}).get("name", "")
    return not any(p in name for p in THROUGH_SERVICE_PATTERNS)


def build_line(elements: list, line_name: str, polygon: list):
    # Filter out through-service relations and their exclusive members
    own_relations = [
        el for el in elements
        if el["type"] == "relation" and is_own_relation(el, line_name)
    ]
    own_member_ids = set()
    for rel in own_relations:
        for m in rel.get("members", []):
            own_member_ids.add(m["ref"])

    nodes = {}
    stop_ids = set()

    for rel in own_relations:
        for m in rel.get("members", []):
            if m["type"] == "node" and m.get("role", "").startswith("stop"):
                stop_ids.add(m["ref"])

    for el in elements:
        if el["type"] == "node" and "lat" in el and "lon" in el:
            nodes[el["id"]] = (el["lon"], el["lat"])

    # First pass: collect segments with at least one point in Tokyo
    way_coords: list[list[tuple[float, float]]] = []
    in_tokyo_endpoints: set[tuple[float, float]] = set()

    for el in elements:
        if el["type"] == "way" and "nodes" in el and el["id"] in own_member_ids:
            coords = [nodes[n] for n in el["nodes"] if n in nodes]
            if not coords:
                continue
            way_coords.append(coords)
            if any(point_in_polygon(c[0], c[1], polygon) for c in coords):
                in_tokyo_endpoints.add(coords[0])
                in_tokyo_endpoints.add(coords[-1])

    # Second pass: include segments that touch a Tokyo endpoint (bridges gaps)
    lines = []
    for coords in way_coords:
        touches_tokyo = (
            any(point_in_polygon(c[0], c[1], polygon) for c in coords)
            or coords[0] in in_tokyo_endpoints
            or coords[-1] in in_tokyo_endpoints
        )
        if touches_tokyo:
            lines.append({
                "type": "Feature",
                "properties": {"line": line_name},
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[r5(c[0]), r5(c[1])] for c in coords],
                },
            })

    stations = []
    for el in elements:
        if el["type"] != "node" or "lat" not in el:
            continue
        if el["id"] not in own_member_ids:
            continue
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue
        is_stop = el["id"] in stop_ids
        is_station = tags.get("railway") in ("station", "halt", "stop")
        if not (is_stop or is_station):
            continue
        if not point_in_polygon(el["lon"], el["lat"], polygon):
            continue
        stations.append({
            "type": "Feature",
            "properties": {"name": name, "lines": [line_name]},
            "geometry": {
                "type": "Point",
                "coordinates": [r5(el["lon"]), r5(el["lat"])],
            },
        })

    return lines, stations


def main():
    if not RAW.exists():
        sys.exit(f"{RAW} not found. Run fetch-railway.py first.")

    polygon = get_tokyo_polygon()

    with open(RAW) as f:
        raw = json.load(f)

    all_lines = []
    station_map: dict[str, dict] = {}

    for name, elements in raw.items():
        lines, stations = build_line(elements, name, polygon)
        all_lines.extend(lines)
        for s in stations:
            key = json.dumps(s["geometry"]["coordinates"])
            if key in station_map:
                station_map[key]["properties"]["lines"].append(name)
            else:
                station_map[key] = s
        print(f"  {name}: {len(lines)} segments, {len(stations)} stations")

    all_stations = list(station_map.values())

    result = {
        "lines": {"type": "FeatureCollection", "features": all_lines},
        "stations": {"type": "FeatureCollection", "features": all_stations},
    }

    OUT.write_text(
        json.dumps(result, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    size_kb = OUT.stat().st_size / 1024
    print(f"\n{len(all_stations)} unique stations, {len(all_lines)} segments, {size_kb:.0f} KB → {OUT}")


if __name__ == "__main__":
    main()
