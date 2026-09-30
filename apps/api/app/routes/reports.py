"""routes/reports.py — POST /reports"""
from __future__ import annotations
import uuid
from fastapi import APIRouter
from app.schemas import ReportSubmission, Report
from app.db import store
from app.ai import dedupe, verify_image as vi, severity as sev
from app.ws import broadcast

router = APIRouter()


@router.post("/", status_code=201)
async def submit_report(body: ReportSubmission):
    """
    Submit a citizen report.
    1. Store report with geom
    2. Geo+time deduplication → cluster_id
    3. Image verification (with fallback)
    4. Confidence + severity classification
    5. Create or update incident
    6. Broadcast via WebSocket
    """
    # 1. Build report record
    report_id = str(uuid.uuid4())
    report = {
        "id": report_id,
        "geom": {"type": "Point", "coordinates": [body.lng, body.lat]},
        "text": body.text,
        "image_url": body.image_url,
        "depth_hint": body.depth_hint,
        "source": body.source,
        "verification": "unverified",
        "confidence": 0.0,
    }
    report = store.add_report(report)

    # 2. Deduplicate
    cluster_id, is_new = dedupe.assign_cluster(report)
    report["cluster_id"] = cluster_id

    # 3. Image verification
    img_result = None
    if body.image_url:
        img_result = await vi.verify_image(body.image_url)

    # Count reports in this cluster
    cluster_reports = [r for r in store.reports if r.get("cluster_id") == cluster_id]
    report_count = len(cluster_reports)

    # 4. Confidence + severity
    # Is zone high-risk? (simple: if any zone risk >= 0.45 near the point)
    from app.ai.risk import score_all_zones
    zone_risks = score_all_zones()
    in_high_risk = any(z["risk"] >= 0.45 for z in zone_risks)

    confidence, verification = sev.confidence_from_signals(img_result, report_count, in_high_risk)
    report["confidence"] = confidence
    report["verification"] = verification

    # 5. Zone risk for severity
    zone_risk = max((z["risk"] for z in zone_risks), default=0.0)
    severity_tier = sev.classify(
        risk=zone_risk,
        report_count=report_count,
        shows_flooding=img_result.get("shows_flooding", False) if img_result else False,
        depth_estimate=body.depth_hint,
        population=30000,
    )

    evidence = {
        "report_count": report_count,
        "image_result": img_result,
        "rainfall_mm_h": store.rainfall.get("zone-001", 0.0),
        "sources": list({r.get("source", "citizen") for r in cluster_reports}),
    }

    recommended = _recommend(verification, severity_tier)

    # 6. Create or update incident
    existing_incident = next(
        (i for i in store.incidents if i.get("cluster_id") == cluster_id), None
    )

    if is_new or existing_incident is None:
        incident = store.add_incident({
            "id": str(uuid.uuid4()),
            "cluster_id": cluster_id,
            "geom": {"type": "Point", "coordinates": [body.lng, body.lat]},
            "severity": severity_tier,
            "status": verification,
            "confidence": confidence,
            "report_count": report_count,
            "evidence": evidence,
            "recommended_action": recommended,
            "assigned_team_id": None,
        })
        report["incident_id"] = incident["id"]
        await broadcast("incident.created", _incident_payload(incident))
    else:
        store.update_incident(existing_incident["id"], {
            "severity": severity_tier,
            "status": verification,
            "confidence": confidence,
            "report_count": report_count,
            "evidence": evidence,
            "recommended_action": recommended,
        })
        report["incident_id"] = existing_incident["id"]
        await broadcast("incident.updated", _incident_payload(existing_incident))

    store.log_event("report.submitted", {"report_id": report_id, "cluster_id": cluster_id})
    return report


def _recommend(status: str, severity: str) -> str:
    if status == "verified" and severity == "critical":
        return "Dispatch rescue team immediately. Initiate evacuation of affected zone."
    if status in ("verified", "probable") and severity == "warning":
        return "Pre-position rescue teams. Monitor closely. Consider evacuation advisory."
    return "Continue monitoring. Assign observation team to assess."


def _incident_payload(inc: dict) -> dict:
    coords = inc.get("geom", {}).get("coordinates", [0, 0])
    d = dict(inc)
    d["lng"] = coords[0]
    d["lat"] = coords[1]
    return d
