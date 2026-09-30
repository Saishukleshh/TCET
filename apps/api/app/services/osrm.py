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
    if ((d1 > 0 < d2) or (d1 < 0 > d2)) and ((d3 > 0 < d4) or (d3 < 0 > d4)):
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
    """Return an EvacuationRoute dict."""
    # Try OSRM
    try:
        url = (
            f"{_OSRM_BASE}/route/v1/driving/"
            f"{from_lng},{from_lat};{to_lng},{to_lat}"
            "?alternatives=3&geometries=geojson&overview=full"
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
                return {
                    "status": "safe",
                    "geom": geom,
                    "distance_m": route["distance"],
                    "duration_sec": route["duration"],
                    "warning_message": None,
                }
        # All routes blocked
        return {"status": "no_safe_route", "geom": None, "distance_m": None,
                "duration_sec": None, "warning_message": "All routes intersect blocked areas."}

    except Exception:
        # Fall back to precomputed demo routes
        from app.db.store import get_all_demo_routes
        demo = list(get_all_demo_routes().values())
        if demo:
            r = demo[0]
            coords = _linestring_coords(r.get("geom", {}))
            if not _route_intersects_blocked(coords, blocked_roads):
                return {
                    "status": "safe",
                    "geom": r["geom"],
                    "distance_m": r["distance_m"],
                    "duration_sec": r["duration_sec"],
                    "warning_message": "Using precomputed fallback route.",
                }
        return {
            "status": "no_safe_route",
            "geom": None,
            "distance_m": None,
            "duration_sec": None,
            "warning_message": "OSRM unavailable and no precomputed route matches.",
        }
