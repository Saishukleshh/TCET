"""
ai/risk.py — Explainable flood-risk scoring per zone.

Formula: risk = 0.40*rain_norm + 0.25*low_elevation + 0.20*history + 0.15*incident_density
Returns factor breakdown so the UI can show the "why" panel.
Start rule-based — swap in XGBoost only if time allows.
"""

from __future__ import annotations
from datetime import datetime, timezone
from shapely.geometry import Point, shape
from app.db import store

# Max rainfall considered for normalisation (mm/h)
RAIN_MAX_MM_H = 100.0
# Elevation below which a zone is considered "low" (m)
LOW_ELEVATION_THRESHOLD = 6.0


def _rain_norm(intensity: float) -> float:
    return min(intensity / RAIN_MAX_MM_H, 1.0)


def _low_elevation_score(elevation_m: float) -> float:
    if elevation_m >= LOW_ELEVATION_THRESHOLD:
        return 0.0
    return 1.0 - (elevation_m / LOW_ELEVATION_THRESHOLD)


def count_incidents_in_zone(zone_feature: dict) -> int:
    """Count incidents whose reported point falls inside the zone polygon."""
    zone_polygon = shape(zone_feature["geometry"])
    count = 0
    for incident in store.incidents:
        coordinates = incident.get("geom", {}).get("coordinates")
        if not isinstance(coordinates, (list, tuple)) or len(coordinates) < 2:
            continue
        try:
            point = Point(float(coordinates[0]), float(coordinates[1]))
        except (TypeError, ValueError):
            continue
        if zone_polygon.covers(point):
            count += 1
    return count


def _incident_density(zone_feature: dict) -> float:
    """Normalize incidents in this zone: 0 to 0, 5+ to 1."""
    count = count_incidents_in_zone(zone_feature)
    return min(count / 5.0, 1.0)


def score_zone(zone_feature: dict) -> dict:
    """Compute risk score for one zone GeoJSON feature. Returns a score dict."""
    props = zone_feature["properties"]
    zone_id = props["id"]

    rain = store.rainfall.get(zone_id, 0.0)
    r_rain   = _rain_norm(rain)
    r_elev   = _low_elevation_score(props["elevation_m"])
    r_hist   = props["history_score"]
    r_dens   = _incident_density(zone_feature)

    # Weighted sum
    risk = (0.40 * r_rain + 0.25 * r_elev + 0.20 * r_hist + 0.15 * r_dens)

    return {
        "zone_id":           zone_id,
        "zone_name":         props["name"],
        "risk":              round(risk, 4),
        "factors": {
            "rain_norm":        round(r_rain, 4),
            "low_elevation":    round(r_elev, 4),
            "history":          round(r_hist, 4),
            "incident_density": round(r_dens, 4),
        },
        "rainfall_mm_h":     rain,
        "population_exposed": props["population"],
        "updated_at":        datetime.now(timezone.utc).isoformat(),
    }


def score_all_zones() -> list[dict]:
    return [score_zone(f) for f in store.get_zones()]


def risk_to_severity(risk: float) -> str:
    if risk >= 0.70:
        return "critical"
    if risk >= 0.45:
        return "warning"
    return "watch"
