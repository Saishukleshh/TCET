"""routes/simulate.py — Demo control panel endpoints (Phase 4)"""
import random, uuid
from fastapi import APIRouter
from app.schemas import SimulateRainRequest, SimulateReportsRequest, SimulateBlockRoadRequest
from app.db import store
from app.ws import broadcast
from app.ai.risk import score_all_zones, risk_to_severity

router = APIRouter()

# Demo report texts to inject
_REPORT_TEXTS = [
    "Water up to ankle level on the main road",
    "Street completely flooded, cars stuck",
    "Basement flooded, family trapped",
    "Knee-deep water near the market",
    "Road is impassable, strong current",
    "Trees down, water rising fast",
    "Drain overflowing, flooding the lane",
    "Emergency! Water inside our home",
    "Children stuck, please send help",
    "Water level rising rapidly",
]

# Demo blocked road coordinates in the Kurla area
_BLOCKED_ROAD_GEOM = {
    "type": "LineString",
    "coordinates": [
        [72.8730, 19.0662], [72.8750, 19.0658],
        [72.8770, 19.0655], [72.8790, 19.0650],
    ]
}


@router.post("/rain")
async def simulate_rain(body: SimulateRainRequest):
    """Set rainfall intensity for all demo zones. Broadcasts rain.updated + risk.updated."""
    for zone_id in store.rainfall:
        store.rainfall[zone_id] = body.intensity_mm_h

    # Recompute risk and broadcast
    zone_scores = score_all_zones()
    await broadcast("rain.updated", {"intensity_mm_h": body.intensity_mm_h, "source": "simulated"})
    await broadcast("risk.updated", {"zones": zone_scores})

    # Auto-create a pending alert if a zone goes critical
    for zs in zone_scores:
        if zs["risk"] >= 0.70:
            tier = "critical"
        elif zs["risk"] >= 0.45:
            tier = "warning"
        else:
            continue
        # Only create if no pending alert for this zone
        existing = any(
            a["zone_id"] == zs["zone_id"] and a["status"] == "pending"
            for a in store.alerts
        )
        if not existing:
            alert = store.add_alert({
                "tier": tier,
                "zone_id": zs["zone_id"],
                "message": (
                    f"Flood risk assessment: {tier.upper()} for {zs['zone_name']}. "
                    f"Risk score {zs['risk']:.0%}. "
                    f"Estimated {zs['population_exposed']:,} residents at risk. "
                    f"Recommended action: immediate evacuation."
                ),
            })
            store.log_event("alert.pending", alert)
            await broadcast("alert.pending", alert)

    store.log_event("simulate.rain", {"intensity_mm_h": body.intensity_mm_h})
    return {"ok": True, "intensity_mm_h": body.intensity_mm_h, "zones": zone_scores}


@router.post("/reports")
async def simulate_reports(body: SimulateReportsRequest):
    """
    Inject N citizen reports around a target zone.
    All rows marked source='simulated'.
    Runs deduplication → expected result: most collapse into 1 incident.
    """
    from app.routes.reports import submit_report
    from app.schemas import ReportSubmission

    zone = store.get_zone(body.zone_id or "zone-001")
    if not zone:
        zone = store.get_zones()[0]
    coords = zone["geometry"]["coordinates"][0]
    cx = sum(p[0] for p in coords) / len(coords)
    cy = sum(p[1] for p in coords) / len(coords)

    results = []
    for i in range(body.count):
        # Cluster 17 near-duplicate reports within 100m, spread 6 further away
        if i < 17:
            dlng = random.uniform(-0.0005, 0.0005)
            dlat = random.uniform(-0.0005, 0.0005)
        else:
            dlng = random.uniform(-0.002, 0.002)
            dlat = random.uniform(-0.002, 0.002)

        submission = ReportSubmission(
            lat=cy + dlat,
            lng=cx + dlng,
            text=random.choice(_REPORT_TEXTS),
            image_url=None,
            depth_hint=random.choice(["ankle", "knee", "waist+", None]),
            source="simulated",
        )
        result = await submit_report(submission)
        results.append(result)

    store.log_event("simulate.reports", {"count": body.count})
    incident_count = len({r.get("incident_id") for r in results if r.get("incident_id")})
    return {
        "ok": True,
        "reports_injected": len(results),
        "incidents_created_or_updated": incident_count,
    }


@router.post("/block-road")
async def simulate_block_road(body: SimulateBlockRoadRequest):
    """Block a road segment. Triggers route.recalculated broadcast."""
    road = store.add_blocked_road({
        "geom": _BLOCKED_ROAD_GEOM,
        "reason": "flooding",
        "active": True,
    })
    store.log_event("road.blocked", {"road_id": road["id"]})
    await broadcast("road.blocked", {"road_id": road["id"], "geom": _BLOCKED_ROAD_GEOM})

    # Simulate route recalculation
    from app.services.osrm import get_route
    blocked = store.get_active_blocked_roads()
    new_route = await get_route(72.8745, 19.0670, 72.8681, 19.0685, blocked)
    await broadcast("route.recalculated", new_route)

    return {"ok": True, "road_id": road["id"], "new_route": new_route}


@router.post("/reset")
async def simulate_reset():
    """Reset all simulated data to seed state."""
    store.reset()
    await broadcast("simulate.reset", {})
    store.log_event("simulate.reset", {})
    return {"ok": True, "message": "Demo state reset to seed data."}


@router.get("/state")
async def get_state():
    """Return current demo state for the simulator panel."""
    return {
        "rainfall": store.rainfall,
        "incidents": len(store.incidents),
        "reports": len(store.reports),
        "blocked_roads": len(store.get_active_blocked_roads()),
        "alerts": len(store.alerts),
        "teams": [{"id": t["id"], "name": t["name"], "status": t["status"]} for t in store.teams],
        "shelters": [{"id": s["id"], "name": s["name"], "capacity": s["capacity"], "occupancy": s["occupancy"]} for s in store.shelters],
    }
