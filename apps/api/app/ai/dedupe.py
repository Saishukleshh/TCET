"""
ai/dedupe.py — Duplicate detection and incident clustering (D-004).

Primary: geo proximity (~150m) + time window (~30 min).
One cluster = one incident with a report_count.
"""

from __future__ import annotations
import math
from typing import Optional
from app.db import store


_CLUSTER_RADIUS_M  = 150.0   # meters
_CLUSTER_TIME_MIN  = 30.0    # minutes


def _haversine_m(lng1: float, lat1: float, lng2: float, lat2: float) -> float:
    """Great-circle distance in metres between two lng/lat points."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def find_cluster(lng: float, lat: float, ts_iso: str) -> Optional[str]:
    """
    Return cluster_id of an existing cluster within radius+time window,
    or None if this is a new incident.
    """
    from datetime import datetime, timezone
    ts = datetime.fromisoformat(ts_iso.replace("Z", "+00:00"))

    for rep in reversed(store.reports):
        # Only consider reports that already have a cluster
        if not rep.get("cluster_id"):
            continue
        r_ts = datetime.fromisoformat(rep["ts"].replace("Z", "+00:00"))
        age_min = abs((ts - r_ts).total_seconds()) / 60
        if age_min > _CLUSTER_TIME_MIN:
            continue
        dist = _haversine_m(lng, lat, rep["geom"]["coordinates"][0], rep["geom"]["coordinates"][1])
        if dist <= _CLUSTER_RADIUS_M:
            return rep["cluster_id"]
    return None


def assign_cluster(report: dict) -> tuple[str, bool]:
    """
    Assign the report to a cluster (existing or new).
    Returns (cluster_id, is_new_incident).
    """
    import uuid
    coords = report["geom"]["coordinates"]
    lng, lat = coords[0], coords[1]
    cluster_id = find_cluster(lng, lat, report["ts"])
    is_new = cluster_id is None
    if is_new:
        cluster_id = str(uuid.uuid4())
    return cluster_id, is_new
