"""routes/incidents.py — GET /incidents, GET /incidents/{id}"""
from fastapi import APIRouter, HTTPException
from app.db import store

router = APIRouter()

_SEVERITY_ORDER = {"critical": 0, "warning": 1, "watch": 2}


@router.get("/")
async def list_incidents():
    """Return incidents sorted by severity desc then created_at desc."""
    def sort_key(inc):
        return (_SEVERITY_ORDER.get(inc.get("severity", "watch"), 2),
                -_ts(inc.get("created_at", "")))
    sorted_inc = sorted(store.incidents, key=sort_key)
    return [_list_item(i) for i in sorted_inc]


@router.get("/{incident_id}")
async def get_incident(incident_id: str):
    inc = store.get_incident(incident_id)
    if not inc:
        raise HTTPException(404, "Incident not found")
    return inc


def _ts(iso: str) -> float:
    from datetime import datetime, timezone
    try:
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp()
    except Exception:
        return 0.0


def _list_item(inc: dict) -> dict:
    coords = inc.get("geom", {}).get("coordinates", [0, 0])
    return {
        "id": inc["id"],
        "severity": inc.get("severity", "watch"),
        "status": inc.get("status", "unverified"),
        "confidence": inc.get("confidence", 0.0),
        "report_count": inc.get("report_count", 1),
        "lng": coords[0],
        "lat": coords[1],
        "created_at": inc.get("created_at", ""),
        "updated_at": inc.get("updated_at", ""),
        "recommended_action": inc.get("recommended_action", ""),
    }
