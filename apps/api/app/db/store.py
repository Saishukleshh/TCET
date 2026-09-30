"""
db/store.py — In-memory data store for the AEGISFLOW demo.

Loaded at startup from JSON seed files. All routes read/write here.
No DB dependency → demo cannot break even without PostgreSQL.
When a real DB is wired up, replace each accessor with a DB query.

Coordinate convention: lng, lat everywhere (GeoJSON standard).
"""

from __future__ import annotations
import json
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ── Resolve data/ directory (two levels up from this file) ────────────────
_DATA = Path(__file__).parent.parent.parent.parent.parent / "data"


def _load(filename: str) -> Any:
    path = _DATA / filename
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return []


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Seed ─────────────────────────────────────────────────────────────────
_ZONE_FC: dict = _load("zones.geojson")  # GeoJSON FeatureCollection
_SHELTERS_SEED: list[dict] = _load("shelters.json")
_TEAMS_SEED: list[dict] = _load("teams.json")
_DEMO_ROUTES: dict = _load("demo_routes.json")

# ── Live state (mutated by routes) ────────────────────────────────────────
shelters: list[dict] = deepcopy(_SHELTERS_SEED)
teams: list[dict] = deepcopy(_TEAMS_SEED)
reports: list[dict] = []
incidents: list[dict] = []
blocked_roads: list[dict] = []
alerts: list[dict] = []
events: list[dict] = []

# Current rainfall intensity per zone (zone_id → mm/h)
rainfall: dict[str, float] = {
    f["properties"]["id"]: 0.0
    for f in _ZONE_FC.get("features", [])
}

# ── Zone helpers ─────────────────────────────────────────────────────────

def get_zones() -> list[dict]:
    return _ZONE_FC.get("features", [])


def get_zone(zone_id: str) -> Optional[dict]:
    for f in get_zones():
        if f["properties"]["id"] == zone_id:
            return f
    return None


# ── Report helpers ────────────────────────────────────────────────────────

def add_report(r: dict) -> dict:
    r.setdefault("id", str(uuid.uuid4()))
    r.setdefault("ts", _now())
    r.setdefault("cluster_id", None)
    r.setdefault("incident_id", None)
    r.setdefault("verification", "unverified")
    r.setdefault("confidence", 0.0)
    r.setdefault("source", "citizen")
    reports.append(r)
    return r


# ── Incident helpers ──────────────────────────────────────────────────────

def add_incident(inc: dict) -> dict:
    inc.setdefault("id", str(uuid.uuid4()))
    inc.setdefault("created_at", _now())
    inc.setdefault("updated_at", _now())
    incidents.append(inc)
    return inc


def update_incident(incident_id: str, patch: dict) -> Optional[dict]:
    for inc in incidents:
        if inc["id"] == incident_id:
            inc.update(patch)
            inc["updated_at"] = _now()
            return inc
    return None


def get_incident(incident_id: str) -> Optional[dict]:
    return next((i for i in incidents if i["id"] == incident_id), None)


# ── Team helpers ──────────────────────────────────────────────────────────

def get_team(team_id: str) -> Optional[dict]:
    return next((t for t in teams if t["id"] == team_id), None)


def update_team(team_id: str, patch: dict) -> Optional[dict]:
    for t in teams:
        if t["id"] == team_id:
            t.update(patch)
            return t
    return None


# ── Alert helpers ─────────────────────────────────────────────────────────

def add_alert(a: dict) -> dict:
    a.setdefault("id", str(uuid.uuid4()))
    a.setdefault("created_at", _now())
    a.setdefault("status", "pending")
    a.setdefault("approved_by", None)
    alerts.append(a)
    return a


def get_alert(alert_id: str) -> Optional[dict]:
    return next((a for a in alerts if a["id"] == alert_id), None)


def update_alert(alert_id: str, patch: dict) -> Optional[dict]:
    for a in alerts:
        if a["id"] == alert_id:
            a.update(patch)
            return a
    return None


# ── Event log ─────────────────────────────────────────────────────────────

def log_event(kind: str, payload: Any) -> dict:
    ev = {"id": str(uuid.uuid4()), "ts": _now(), "kind": kind, "payload": payload}
    events.append(ev)
    return ev


# ── Blocked roads ─────────────────────────────────────────────────────────

def add_blocked_road(road: dict) -> dict:
    road.setdefault("id", str(uuid.uuid4()))
    road.setdefault("ts", _now())
    road.setdefault("active", True)
    blocked_roads.append(road)
    return road


def get_active_blocked_roads() -> list[dict]:
    return [r for r in blocked_roads if r.get("active", True)]


# ── Demo reset ────────────────────────────────────────────────────────────

def reset() -> None:
    global shelters, teams, reports, incidents, blocked_roads, alerts, events, rainfall
    shelters = deepcopy(_SHELTERS_SEED)
    teams = deepcopy(_TEAMS_SEED)
    reports.clear()
    incidents.clear()
    blocked_roads.clear()
    alerts.clear()
    events.clear()
    for zone_id in rainfall:
        rainfall[zone_id] = 0.0


# ── Demo routes fallback ──────────────────────────────────────────────────

def get_demo_route(key: str) -> Optional[dict]:
    return _DEMO_ROUTES.get(key)


def get_all_demo_routes() -> dict:
    return _DEMO_ROUTES
