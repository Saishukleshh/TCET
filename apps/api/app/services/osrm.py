"""
services/osrm.py — OSRM routing with polygon-avoidance (D-005).

1. Ask OSRM for route + alternatives.
2. Reject any route whose linestring intersects a blocked-road or flood polygon.
3. Return fastest safe route, or "no_safe_route" if none clear.
4. Falls back to demo_routes.json if OSRM is unreachable.
"""

from __future__ import annotations
import os
import json
import math
import httpx
from typing import Optional

_OSRM_BASE = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")


def _linestring_coords(geom: dict) -> list[tuple[float, float]]:
    return [(c[0], c[1]) for c in geom.get("coordinates", [])]


def _segments_intersect(p1, p2, p3, p4) -> bool:
    """Check if segment p1-p2 intersects p3-p4 (2-D)."""
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    d1 = cross(p3, p4, p1)
    d2 = cross(p3, p4, p2)
    d3 = cross(p1, p2, p3)
    d4 = cross(p1, p2, p4)
    if ((d1 > 0 and d2 < 0) or (d1 < 0 and d2 > 0)) and \
       ((d3 > 0 and d4 < 0) or (d3 < 0 and d4 > 0)):
        return True
    return False


def _route_intersects_blocked(route_coords: list, blocked_roads: list[dict]) -> bool:
    """Return True if any segment of the route crosses any active blocked road."""
    for road in blocked_roads:
        geom = road.get("geom", {})
        if not geom:
            continue
        blocked_coords = _linestring_coords(geom)
        for i in range(len(route_coords) - 1):
            for j in range(len(blocked_coords) - 1):
                if _segments_intersect(
                    route_coords[i], route_coords[i + 1],
                    blocked_coords[j], blocked_coords[j + 1]
                ):
                    return True
    return False


async def get_route(
    from_lng: float, from_lat: float,
    to_lng: float, to_lat: float,
    blocked_roads: list[dict],
) -> dict:
    """
    Return an EvacuationRoute dict.
    1. Query OSRM HTTP API for routes and alternative candidates with turn-by-turn steps.
    2. Check each candidate route against active blocked roads/flood polygons.
    3. Return fastest unblocked safe route.
    4. If OSRM is unreachable, select the closest unblocked precomputed demo route.
    """
    # 1. Try OSRM HTTP API
    try:
        url = (
            f"{_OSRM_BASE}/route/v1/driving/"
            f"{from_lng},{from_lat};{to_lng},{to_lat}"
            "?alternatives=3&geometries=geojson&overview=full&steps=true"
        )
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        routes = data.get("routes", [])
        for route in sorted(routes, key=lambda r: r["duration"]):
            geom = route["geometry"]
            coords = _linestring_coords(geom)
            if not _route_intersects_blocked(coords, blocked_roads):
                # Extract turn-by-turn maneuvers if available
                steps = []
                for leg in route.get("legs", []):
                    for step in leg.get("steps", []):
                        name = step.get("name", "")
                        maneuver = step.get("maneuver", {}).get("type", "")
                        dist = step.get("distance", 0)
                        if name or maneuver:
                            steps.append({
                                "instruction": f"{maneuver.capitalize()} onto {name}" if name else maneuver.capitalize(),
                                "distance_m": round(dist, 1),
                            })

                return {
                    "status": "safe",
                    "geom": geom,
                    "distance_m": round(route["distance"], 1),
                    "duration_sec": round(route["duration"], 1),
                    "warning_message": None,
                    "steps": steps,
                }

        # All OSRM routes intersect blocked areas
        return {
            "status": "no_safe_route",
            "geom": None,
            "distance_m": None,
            "duration_sec": None,
            "warning_message": "All calculated routes intersect active flood or blocked road zones.",
            "steps": [],
        }

    except Exception:
        # 2. Fall back to precomputed demo routes (find closest unblocked match)
        from app.db.store import get_all_demo_routes
        demo_routes = list(get_all_demo_routes().values())

        best_route = None
        min_dist = float("inf")

        for r in demo_routes:
            geom = r.get("geom", {})
            coords = _linestring_coords(geom)
            if not coords:
                continue

            if not _route_intersects_blocked(coords, blocked_roads):
                # Calculate distance from requested endpoints to demo route endpoints
                start_c = coords[0]
                end_c = coords[-1]
                delta = (
                    math.hypot(start_c[0] - from_lng, start_c[1] - from_lat) +
                    math.hypot(end_c[0] - to_lng, end_c[1] - to_lat)
                )
                if delta < min_dist:
                    min_dist = delta
                    best_route = r

        if best_route:
            return {
                "status": "safe",
                "geom": best_route["geom"],
                "distance_m": best_route["distance_m"],
                "duration_sec": best_route["duration_sec"],
                "warning_message": "Using verified precomputed emergency corridor.",
                "steps": best_route.get("steps", []),
            }

        return {
            "status": "no_safe_route",
            "geom": None,
            "distance_m": None,
            "duration_sec": None,
            "warning_message": "Routing engine unavailable and no precomputed corridor matches.",
            "steps": [],
        }
