"""routes/routing.py — POST /routes/evacuation"""
from fastapi import APIRouter
from app.schemas import EvacuationRouteRequest
from app.services.osrm import get_route
from app.db.store import get_active_blocked_roads
from app.ws import broadcast

router = APIRouter()


@router.post("/evacuation")
async def get_evacuation_route(body: EvacuationRouteRequest):
    """
    Compute a safe evacuation route.
    Rejects routes crossing active blocked-road polygons.
    Falls back to precomputed demo routes when OSRM is unavailable.
    """
    blocked = get_active_blocked_roads()
    result = await get_route(body.from_lng, body.from_lat, body.to_lng, body.to_lat, blocked)

    if result["status"] == "safe":
        await broadcast("route.recalculated", result)

    return result
