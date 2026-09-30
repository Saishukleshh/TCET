"""routes/allocate.py — POST /allocate (Hungarian algorithm, D-006)"""
from __future__ import annotations
import uuid, math
from fastapi import APIRouter, HTTPException
from app.schemas import AllocationRequest
from app.db import store
from app.ws import broadcast

router = APIRouter()


def _haversine_m(lng1, lat1, lng2, lat2) -> float:
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi, dlam = math.radians(lat2 - lat1), math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return 2 * R * math.asin(math.sqrt(a))


@router.post("/")
async def allocate_resources(body: AllocationRequest):
    """
    Assign available teams to incidents using the Hungarian algorithm.
    Cost = travel_time_score + severity_weight.
    """
    try:
        from scipy.optimize import linear_sum_assignment
        import numpy as np
        has_scipy = True
    except ImportError:
        has_scipy = False

    incidents = [store.get_incident(iid) for iid in body.incident_ids]
    incidents = [i for i in incidents if i]
    if not incidents:
        raise HTTPException(400, "No valid incident IDs provided")

    available_teams = [t for t in store.teams if t["status"] == "available"]
    if not available_teams:
        return {"assignments": [], "message": "No available teams"}

    sev_weight = {"critical": 1.0, "warning": 0.6, "watch": 0.3}

    # Build cost matrix (teams × incidents)
    n_teams = len(available_teams)
    n_inc   = len(incidents)

    if has_scipy:
        import numpy as np
        cost = np.zeros((n_teams, n_inc))
        for ti, team in enumerate(available_teams):
            t_coords = team["geom"]["coordinates"] if "geom" in team else [team["lng"], team["lat"]]
            for ii, inc in enumerate(incidents):
                i_coords = inc["geom"]["coordinates"]
                dist = _haversine_m(t_coords[0], t_coords[1], i_coords[0], i_coords[1])
                travel = dist / 833.0  # ~50 km/h ≈ 833 m/min
                s_weight = sev_weight.get(inc.get("severity", "watch"), 0.3)
                cost[ti, ii] = travel * (2 - s_weight)
        row_ind, col_ind = linear_sum_assignment(cost)
    else:
        # Greedy fallback: assign nearest team to each incident
        row_ind, col_ind = [], []
        used = set()
        for ii in range(n_inc):
            best_t, best_cost = -1, float("inf")
            for ti in range(n_teams):
                if ti in used:
                    continue
                team = available_teams[ti]
                t_coords = team.get("geom", {}).get("coordinates", [team.get("lng",0), team.get("lat",0)])
                inc = incidents[ii]
                i_coords = inc["geom"]["coordinates"]
                d = _haversine_m(t_coords[0], t_coords[1], i_coords[0], i_coords[1])
                if d < best_cost:
                    best_cost, best_t = d, ti
            if best_t >= 0:
                row_ind.append(best_t)
                col_ind.append(ii)
                used.add(best_t)

    assignments = []
    for ti, ii in zip(row_ind, col_ind):
        if ii >= n_inc:
            continue
        team = available_teams[ti]
        inc  = incidents[ii]
        t_coords = team["geom"]["coordinates"] if "geom" in team else [team.get("lng", 0), team.get("lat", 0)]
        i_coords = inc["geom"]["coordinates"]
        dist = _haversine_m(t_coords[0], t_coords[1], i_coords[0], i_coords[1])
        eta = int(dist / 833)  # minutes at 50 km/h

        asn = {"id": str(uuid.uuid4()), "incident_id": inc["id"],
               "team_id": team["id"], "eta_min": eta, "approved_by": None}
        assignments.append(asn)

        store.update_team(team["id"], {"status": "assigned", "incident_id": inc["id"]})
        store.update_incident(inc["id"], {"assigned_team_id": team["id"]})
        store.assignments.append(asn)

    store.log_event("resource.assigned", {"count": len(assignments)})
    await broadcast("resource.assigned", {"assignments": assignments})
    return {"assignments": assignments}
