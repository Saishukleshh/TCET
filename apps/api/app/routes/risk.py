"""routes/risk.py — GET /risk/zones and GET /risk/sitrep/{zone_id}"""
from fastapi import APIRouter, HTTPException
from app.ai.risk import score_all_zones
from app.ai.sitrep import generate_situation_brief
from app.db.store import get_zones, get_zone, rainfall, incidents, shelters, teams

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


@router.get("/sitrep/{zone_id}")
async def get_zone_sitrep(zone_id: str):
    """
    Generate an AI Situation Briefing for the specified sector via Groq Llama 3.3.
    """
    zone = get_zone(zone_id)
    if not zone:
        raise HTTPException(404, f"Zone '{zone_id}' not found")

    scores = {s["zone_id"]: s for s in score_all_zones()}
    score = scores.get(zone_id, {})
    risk_score = float(score.get("risk", 0.35))
    rain = float(rainfall.get(zone_id, 0.0))

    # Relevant counts
    inc_count = len(incidents)
    open_shelters = len([s for s in shelters if s.get("status") == "open"])
    avail_teams = len([t for t in teams if t.get("status") == "available"])

    brief = await generate_situation_brief(
        zone_name=zone["properties"]["name"],
        risk_score=risk_score,
        rainfall_mm_h=rain,
        incident_count=inc_count,
        open_shelters_count=open_shelters,
        available_teams=avail_teams,
    )

    from app.ai.groq_client import is_groq_available

    model_name = "Groq Llama 3.3" if is_groq_available() else "Deterministic Heuristic"
    actions = brief.get("recommended_actions", [])
    action_str = "; ".join(actions) if isinstance(actions, list) else str(actions)

    return {
        "zone_id": zone_id,
        "zone_name": zone["properties"]["name"],
        "risk_level": brief.get("alert_tier", "watch"),
        "summary": brief.get("tactical_assessment") or brief.get("headline", ""),
        "recommended_action": action_str,
        "confidence": 0.94 if is_groq_available() else 0.88,
        "evidence": {
            "rainfall_mm_h": rain,
            "incident_count": inc_count,
            "open_shelters": open_shelters,
            "available_teams": avail_teams,
        },
        "model": model_name,
        "brief": brief,
    }
