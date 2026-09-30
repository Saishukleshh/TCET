"""routes/alerts.py — Alert CRUD + approve/reject"""
import uuid
from fastapi import APIRouter, HTTPException
from app.schemas import AlertApprovalRequest
from app.db import store
from app.ws import broadcast
from app.services.translate import translate_alert

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
        "translations": None,
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

    # Translate after approval, before broadcast
    zone_name = alert.get("zone_id", "affected area")
    translations = await translate_alert(
        message_en=alert["message"],
        tier=alert.get("tier", "warning"),
        zone=zone_name,
    )
    store.update_alert(alert_id, {
        "status": "approved",
        "approved_by": body.approved_by,
        "translations": translations,
    })
    alert = store.get_alert(alert_id)
    store.log_event("alert.approved", alert)
    await broadcast("alert.approved", alert)
    return alert


@router.post("/{alert_id}/send")
async def send_alert(alert_id: str, body: AlertApprovalRequest):
    """Transmit an approved alert to citizens. Requires prior approval."""
    alert = store.get_alert(alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    if alert["status"] != "approved":
        raise HTTPException(400, f"Alert must be 'approved' before sending; current status: '{alert['status']}'")

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
