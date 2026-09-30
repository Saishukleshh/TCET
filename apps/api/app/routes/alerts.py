"""routes/alerts.py — Alert CRUD + approve/reject"""
import uuid
from fastapi import APIRouter, HTTPException
from app.schemas import AlertApprovalRequest
from app.db import store
from app.ws import broadcast

router = APIRouter()


@router.get("/")
async def list_alerts():
    return sorted(store.alerts, key=lambda a: a.get("created_at", ""), reverse=True)


@router.post("/")
async def create_alert(body: dict):
    """Create a pending alert (called internally or by simulator)."""
    alert = store.add_alert({
        "id": str(uuid.uuid4()),
        "tier": body.get("tier", "watch"),
        "zone_id": body.get("zone_id", ""),
        "message": body.get("message", ""),
        "status": "pending",
        "approved_by": None,
    })
    store.log_event("alert.pending", alert)
    await broadcast("alert.pending", alert)
    return alert


@router.post("/{alert_id}/approve")
async def approve_alert(alert_id: str, body: AlertApprovalRequest):
    alert = store.get_alert(alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    if alert["status"] != "pending":
        raise HTTPException(400, f"Alert is already '{alert['status']}'")

    store.update_alert(alert_id, {"status": "approved", "approved_by": body.approved_by})
    store.update_alert(alert_id, {"status": "sent"})
    alert = store.get_alert(alert_id)
    store.log_event("alert.sent", alert)
    await broadcast("alert.sent", alert)
    return alert


@router.post("/{alert_id}/reject")
async def reject_alert(alert_id: str, body: AlertApprovalRequest):
    alert = store.get_alert(alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    if alert["status"] != "pending":
        raise HTTPException(400, f"Alert is already '{alert['status']}'")

    store.update_alert(alert_id, {"status": "rejected", "approved_by": body.approved_by})
    alert = store.get_alert(alert_id)
    store.log_event("alert.rejected", alert)
    await broadcast("alert.rejected", alert)
    return alert
