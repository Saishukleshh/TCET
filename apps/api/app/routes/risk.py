"""routes/risk.py — GET /risk/zones"""
from fastapi import APIRouter
from app.ai.risk import score_all_zones
from app.db.store import get_zones

router = APIRouter()


@router.get("/zones")
async def get_zone_risk():
    """
    Return zone risk scores as GeoJSON FeatureCollection.
    Each feature has the risk score + factor breakdown ("why") + zone polygon.
    """
    scores = {s["zone_id"]: s for s in score_all_zones()}
    zones = get_zones()

    features = []
    for zone in zones:
        zid = zone["properties"]["id"]
        score = scores.get(zid, {})
        features.append({
            "type": "Feature",
            "geometry": zone["geometry"],
            "properties": {
                **zone["properties"],
                **score,
            }
        })

    return {"type": "FeatureCollection", "features": features}
