"""
schemas.py — Pydantic v2 models.
Keep in sync with packages/shared/src/types/*.ts (TypeScript mirror).
"""

from __future__ import annotations
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field
from datetime import datetime


# ── Enums / literals ────────────────────────────────────────────────────────

VerificationStatus = Literal["verified", "probable", "unverified"]
AlertTier = Literal["watch", "warning", "critical"]
AlertStatus = Literal["pending", "approved", "sent", "rejected"]
TeamStatus = Literal["available", "assigned", "en_route", "deployed"]
ShelterStatus = Literal["open", "full", "closed"]
DepthHint = Literal["ankle", "knee", "waist+"]
RouteStatus = Literal["safe", "no_safe_route"]


# ── Geo helpers ──────────────────────────────────────────────────────────────

class GeoPoint(BaseModel):
    """[lng, lat] — GeoJSON convention. Never swap the order."""
    type: Literal["Point"] = "Point"
    coordinates: tuple[float, float]  # (lng, lat)


class GeoLineString(BaseModel):
    type: Literal["LineString"] = "LineString"
    coordinates: list[tuple[float, float]]


# ── Reports ─────────────────────────────────────────────────────────────────

class ReportSubmission(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    lng: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")
    text: str = Field(..., min_length=1, max_length=2000, description="Citizen report observation")
    image_url: Optional[str] = Field(default=None, max_length=1000)
    depth_hint: Optional[DepthHint] = None
    source: str = Field(default="citizen", max_length=50)  # set to "simulated" for injected rows


class Report(BaseModel):
    id: str
    geom: GeoPoint
    text: str
    image_url: Optional[str] = None
    depth_hint: Optional[DepthHint] = None
    ts: datetime
    cluster_id: Optional[str] = None
    incident_id: Optional[str] = None
    verification: VerificationStatus = "unverified"
    confidence: float = Field(ge=0, le=1)
    source: str


# ── Image verification ───────────────────────────────────────────────────────

class ImageVerificationResult(BaseModel):
    shows_flooding: bool
    depth_estimate: Optional[str] = None
    confidence: float = Field(ge=0, le=1)
    model_used: str


# ── Incidents ───────────────────────────────────────────────────────────────

class Evidence(BaseModel):
    report_count: int
    image_result: Optional[ImageVerificationResult] = None
    rainfall_mm_h: Optional[float] = None
    sources: list[str] = []


class Incident(BaseModel):
    id: str
    geom: GeoPoint
    severity: AlertTier
    status: VerificationStatus
    confidence: float = Field(ge=0, le=1)
    report_count: int
    evidence: Evidence
    recommended_action: str
    assigned_team_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class IncidentListItem(BaseModel):
    id: str
    severity: AlertTier
    status: VerificationStatus
    confidence: float
    report_count: int
    lat: float
    lng: float
    created_at: datetime
    updated_at: datetime


# ── Risk ────────────────────────────────────────────────────────────────────

class RiskFactors(BaseModel):
    rain_norm: float
    low_elevation: float
    history: float
    incident_density: float


class ZoneRiskScore(BaseModel):
    zone_id: str
    zone_name: str
    risk: float = Field(ge=0, le=1)
    factors: RiskFactors
    rainfall_mm_h: float
    population_exposed: int
    updated_at: datetime


# ── Resources ───────────────────────────────────────────────────────────────

class Shelter(BaseModel):
    id: str
    geom: GeoPoint
    name: str
    capacity: int
    occupancy: int
    status: ShelterStatus


class Team(BaseModel):
    id: str
    geom: GeoPoint
    name: str
    type: str
    status: TeamStatus
    incident_id: Optional[str] = None


class Assignment(BaseModel):
    id: str
    incident_id: str
    team_id: str
    eta_min: int
    approved_by: Optional[str] = None


class AllocationRequest(BaseModel):
    incident_ids: list[str] = Field(..., min_length=1, max_length=100)


class AllocationResult(BaseModel):
    assignments: list[Assignment]


# ── Routing ─────────────────────────────────────────────────────────────────

class EvacuationRouteRequest(BaseModel):
    from_lng: float = Field(..., ge=-180.0, le=180.0)
    from_lat: float = Field(..., ge=-90.0, le=90.0)
    to_lng: float = Field(..., ge=-180.0, le=180.0)
    to_lat: float = Field(..., ge=-90.0, le=90.0)


class EvacuationRoute(BaseModel):
    status: RouteStatus
    geom: Optional[GeoLineString] = None
    distance_m: Optional[float] = None
    duration_sec: Optional[float] = None
    warning_message: Optional[str] = None


# ── Alerts ───────────────────────────────────────────────────────────────────

class Alert(BaseModel):
    id: str
    tier: AlertTier
    zone_id: str
    message: str
    status: AlertStatus
    approved_by: Optional[str] = None
    created_at: datetime


class AlertApprovalRequest(BaseModel):
    approved_by: str = Field(..., min_length=1, max_length=100)


# ── Events ───────────────────────────────────────────────────────────────────

class DomainEvent(BaseModel):
    id: str
    ts: datetime
    kind: str
    payload: Any


# ── Simulate ─────────────────────────────────────────────────────────────────

class SimulateRainRequest(BaseModel):
    intensity_mm_h: float = Field(ge=0, le=200)


class SimulateReportsRequest(BaseModel):
    count: int = Field(default=23, ge=1, le=200)
    zone_id: Optional[str] = Field(default=None, max_length=100)


class SimulateBlockRoadRequest(BaseModel):
    road_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
