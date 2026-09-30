"""
tests/test_logic.py — Unit tests for AEGISFLOW pure logic functions.
Run: pytest apps/api/tests/ -v
All tests are fast; no real network calls (OSRM, weather, LLM are mocked).
"""

import math
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, timezone, timedelta


# ── Flood Risk Score ──────────────────────────────────────────────────────────

class TestRiskScore:
    def _score(self, rain=0.0, elevation_m=5.0, history=0.5, incidents=0):
        """Helper: build a minimal zone feature and score it."""
        from app.ai.risk import score_zone
        from app.db import store

        zone = {
            "properties": {
                "id": "test-zone",
                "name": "Test Zone",
                "elevation_m": elevation_m,
                "history_score": history,
                "population": 10000,
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[72.87, 19.06], [72.88, 19.06], [72.88, 19.07], [72.87, 19.07], [72.87, 19.06]]],
            },
        }
        store.rainfall["test-zone"] = rain
        # Inject fake incidents inside the polygon if needed
        original = list(store.incidents)
        for _ in range(incidents):
            store.incidents.append({
                "geom": {"type": "Point", "coordinates": [72.875, 19.065]}
            })
        result = score_zone(zone)
        store.incidents[:] = original
        store.rainfall.pop("test-zone", None)
        return result

    def test_risk_monotonic_with_rainfall(self):
        r_low = self._score(rain=10.0)["risk"]
        r_high = self._score(rain=80.0)["risk"]
        assert r_high > r_low

    def test_risk_bounds_0_to_1(self):
        r = self._score(rain=200.0, elevation_m=0.0, history=1.0, incidents=10)["risk"]
        assert 0.0 <= r <= 1.0

    def test_risk_zero_when_all_factors_zero(self):
        # elevation above threshold → low_elevation=0, rain=0, history=0, incidents=0
        r = self._score(rain=0.0, elevation_m=10.0, history=0.0, incidents=0)["risk"]
        assert r == 0.0

    def test_factor_breakdown_sums_to_score(self):
        result = self._score(rain=50.0, elevation_m=3.0, history=0.6, incidents=2)
        f = result["factors"]
        expected = round(
            0.40 * f["rain_norm"] +
            0.25 * f["low_elevation"] +
            0.20 * f["history"] +
            0.15 * f["incident_density"],
            4,
        )
        assert abs(result["risk"] - expected) < 1e-6

    def test_weights_sum_to_one(self):
        assert abs(0.40 + 0.25 + 0.20 + 0.15 - 1.0) < 1e-9


# ── Deduplication ─────────────────────────────────────────────────────────────

class TestDedupe:
    def _ts(self, offset_min=0):
        return (datetime.now(timezone.utc) + timedelta(minutes=offset_min)).isoformat()

    def test_same_place_same_time_joins_cluster(self):
        from app.ai.dedupe import find_cluster
        from app.db import store

        store.reports.clear()
        store.reports.append({
            "cluster_id": "cluster-abc",
            "geom": {"type": "Point", "coordinates": [72.875, 19.068]},
            "ts": self._ts(0),
        })
        result = find_cluster(72.8751, 19.0681, self._ts(1))
        assert result == "cluster-abc"
        store.reports.clear()

    def test_500m_apart_does_not_join(self):
        from app.ai.dedupe import find_cluster
        from app.db import store

        store.reports.clear()
        store.reports.append({
            "cluster_id": "cluster-far",
            "geom": {"type": "Point", "coordinates": [72.875, 19.068]},
            "ts": self._ts(0),
        })
        # ~550 m east
        result = find_cluster(72.882, 19.068, self._ts(1))
        assert result is None
        store.reports.clear()

    def test_2h_apart_does_not_join(self):
        from app.ai.dedupe import find_cluster
        from app.db import store

        store.reports.clear()
        store.reports.append({
            "cluster_id": "cluster-old",
            "geom": {"type": "Point", "coordinates": [72.875, 19.068]},
            "ts": self._ts(-130),  # 130 min ago
        })
        result = find_cluster(72.875, 19.068, self._ts(0))
        assert result is None
        store.reports.clear()

    def test_new_cluster_created_when_no_match(self):
        from app.ai.dedupe import assign_cluster
        from app.db import store

        store.reports.clear()
        report = {
            "geom": {"type": "Point", "coordinates": [72.875, 19.068]},
            "ts": self._ts(0),
        }
        cluster_id, is_new = assign_cluster(report)
        assert is_new is True
        assert cluster_id is not None
        store.reports.clear()


# ── Confidence & Verification ─────────────────────────────────────────────────

class TestConfidence:
    def test_verified_threshold(self):
        from app.ai.severity import confidence_from_signals
        conf, status = confidence_from_signals(
            image_result={"shows_flooding": True, "confidence": 0.9},
            report_count=10,
            in_high_risk_zone=True,
        )
        assert status == "verified"
        assert conf >= 0.70

    def test_probable_threshold(self):
        from app.ai.severity import confidence_from_signals
        # 0.50*0.6 + 0.20 + 0.0 = 0.50 → probable
        conf, status = confidence_from_signals(
            image_result={"shows_flooding": True, "confidence": 0.6},
            report_count=5,
            in_high_risk_zone=False,
        )
        assert status == "probable"
        assert 0.40 <= conf < 0.70

    def test_unverified_threshold(self):
        from app.ai.severity import confidence_from_signals
        conf, status = confidence_from_signals(
            image_result=None,
            report_count=1,
            in_high_risk_zone=False,
        )
        assert status == "unverified"
        assert conf < 0.40

    def test_photo_failure_falls_back_to_unverified(self):
        from app.ai.severity import confidence_from_signals
        # image_result with shows_flooding=False simulates failed/negative verification
        conf, status = confidence_from_signals(
            image_result={"shows_flooding": False, "confidence": 0.0},
            report_count=1,
            in_high_risk_zone=False,
        )
        assert status == "unverified"


# ── Routing ───────────────────────────────────────────────────────────────────

class TestRouting:
    def test_route_crossing_blocked_road_is_rejected(self):
        from app.services.osrm import _route_intersects_blocked

        route_coords = [(72.870, 19.065), (72.875, 19.065), (72.880, 19.065)]
        blocked_roads = [{
            "geom": {
                "type": "LineString",
                "coordinates": [[72.874, 19.063], [72.874, 19.067]],
            }
        }]
        assert _route_intersects_blocked(route_coords, blocked_roads) is True

    def test_route_not_crossing_blocked_road_is_safe(self):
        from app.services.osrm import _route_intersects_blocked

        route_coords = [(72.870, 19.065), (72.872, 19.065)]
        blocked_roads = [{
            "geom": {
                "type": "LineString",
                "coordinates": [[72.880, 19.063], [72.880, 19.067]],
            }
        }]
        assert _route_intersects_blocked(route_coords, blocked_roads) is False

    @pytest.mark.asyncio
    async def test_no_safe_route_when_all_blocked(self):
        from app.services.osrm import get_route

        # A blocker that crosses the exact OSRM mock route segment
        blocked = [{
            "geom": {
                "type": "LineString",
                "coordinates": [[72.873, 19.064], [72.875, 19.067]],
            }
        }]

        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = {
            "routes": [{
                "duration": 300,
                "distance": 1000,
                "geometry": {"type": "LineString", "coordinates": [[72.872, 19.065], [72.876, 19.065]]},
                "legs": [],
            }]
        }

        mock_get = AsyncMock(return_value=mock_resp)
        mock_client_instance = MagicMock()
        mock_client_instance.get = mock_get
        mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
        mock_client_instance.__aexit__ = AsyncMock(return_value=False)

        with patch("app.services.osrm.httpx.AsyncClient", return_value=mock_client_instance):
            with patch("app.db.store.get_all_demo_routes", return_value={}):
                result = await get_route(72.872, 19.065, 72.876, 19.065, blocked)

        assert result["status"] == "no_safe_route"
        assert result["geom"] is None


# ── Allocation ────────────────────────────────────────────────────────────────

class TestAllocation:
    def _setup_store(self, n_teams=3, n_incidents=2):
        from app.db import store
        store.teams.clear()
        store.incidents.clear()
        store.assignments.clear()

        for i in range(n_teams):
            store.teams.append({
                "id": f"team-{i}",
                "name": f"Team {i}",
                "type": "rescue",
                "status": "available",
                "geom": {"type": "Point", "coordinates": [72.875 + i * 0.001, 19.068]},
                "incident_id": None,
            })

        for i in range(n_incidents):
            store.incidents.append({
                "id": f"inc-{i}",
                "severity": "critical" if i == 0 else "watch",
                "geom": {"type": "Point", "coordinates": [72.876 + i * 0.001, 19.069]},
                "status": "verified",
                "confidence": 0.9,
                "report_count": 5,
                "evidence": {},
                "recommended_action": "",
                "assigned_team_id": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })

    def teardown_method(self):
        from app.db import store
        store.teams.clear()
        store.incidents.clear()
        store.assignments.clear()

    @pytest.mark.asyncio
    async def test_no_team_assigned_twice(self):
        from app.routes.allocate import allocate_resources
        from app.schemas import AllocationRequest
        self._setup_store(n_teams=3, n_incidents=2)

        req = AllocationRequest(incident_ids=["inc-0", "inc-1"])
        result = await allocate_resources(req)
        team_ids = [a["team_id"] for a in result["assignments"]]
        assert len(team_ids) == len(set(team_ids)), "Same team assigned twice"

    @pytest.mark.asyncio
    async def test_higher_severity_gets_priority(self):
        from app.routes.allocate import allocate_resources
        from app.schemas import AllocationRequest
        from app.db import store
        self._setup_store(n_teams=1, n_incidents=2)

        req = AllocationRequest(incident_ids=["inc-0", "inc-1"])
        result = await allocate_resources(req)
        # Only 1 team available — it should be assigned to the critical incident
        assert len(result["assignments"]) == 1
        assert result["assignments"][0]["incident_id"] == "inc-0"

    @pytest.mark.asyncio
    async def test_assignments_persisted_in_store(self):
        from app.routes.allocate import allocate_resources
        from app.schemas import AllocationRequest
        from app.db import store
        self._setup_store(n_teams=2, n_incidents=2)

        req = AllocationRequest(incident_ids=["inc-0", "inc-1"])
        result = await allocate_resources(req)
        assert len(store.assignments) == len(result["assignments"])


# ── Alerts ────────────────────────────────────────────────────────────────────

class TestAlerts:
    def teardown_method(self):
        from app.db import store
        store.alerts.clear()
        store.events.clear()

    @pytest.mark.asyncio
    async def test_alert_cannot_be_sent_without_approval(self):
        from app.routes.alerts import send_alert
        from app.schemas import AlertApprovalRequest
        from app.db import store
        from fastapi import HTTPException

        store.add_alert({"id": "alert-001", "tier": "critical", "zone_id": "zone-001",
                         "message": "test", "status": "pending"})

        with pytest.raises(HTTPException) as exc_info:
            await send_alert("alert-001", AlertApprovalRequest(approved_by="Commander"))
        assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_approve_sets_approved_not_sent(self):
        from app.routes.alerts import approve_alert
        from app.schemas import AlertApprovalRequest
        from app.db import store

        store.add_alert({"id": "alert-002", "tier": "warning", "zone_id": "zone-001",
                         "message": "test", "status": "pending"})

        result = await approve_alert("alert-002", AlertApprovalRequest(approved_by="Commander"))
        assert result["status"] == "approved"
        assert result["approved_by"] == "Commander"

    @pytest.mark.asyncio
    async def test_send_after_approve_sets_sent(self):
        from app.routes.alerts import approve_alert, send_alert
        from app.schemas import AlertApprovalRequest
        from app.db import store

        store.add_alert({"id": "alert-003", "tier": "watch", "zone_id": "zone-001",
                         "message": "test", "status": "pending"})

        await approve_alert("alert-003", AlertApprovalRequest(approved_by="Commander"))
        result = await send_alert("alert-003", AlertApprovalRequest(approved_by="Commander"))
        assert result["status"] == "sent"

    @pytest.mark.asyncio
    async def test_double_approve_rejected(self):
        from app.routes.alerts import approve_alert
        from app.schemas import AlertApprovalRequest
        from app.db import store
        from fastapi import HTTPException

        store.add_alert({"id": "alert-004", "tier": "watch", "zone_id": "zone-001",
                         "message": "test", "status": "pending"})

        await approve_alert("alert-004", AlertApprovalRequest(approved_by="Commander"))
        with pytest.raises(HTTPException) as exc_info:
            await approve_alert("alert-004", AlertApprovalRequest(approved_by="Commander"))
        assert exc_info.value.status_code == 400


# ── POST /reports validation ──────────────────────────────────────────────────

class TestReportsValidation:
    def test_rejects_out_of_range_lat(self):
        from pydantic import ValidationError
        from app.schemas import ReportSubmission
        with pytest.raises(ValidationError):
            ReportSubmission(lat=95.0, lng=72.875, text="flood")

    def test_rejects_out_of_range_lng(self):
        from pydantic import ValidationError
        from app.schemas import ReportSubmission
        with pytest.raises(ValidationError):
            ReportSubmission(lat=19.068, lng=200.0, text="flood")

    def test_rejects_empty_text(self):
        from pydantic import ValidationError
        from app.schemas import ReportSubmission
        with pytest.raises(ValidationError):
            ReportSubmission(lat=19.068, lng=72.875, text="")

    def test_rejects_oversized_text(self):
        from pydantic import ValidationError
        from app.schemas import ReportSubmission
        with pytest.raises(ValidationError):
            ReportSubmission(lat=19.068, lng=72.875, text="x" * 2001)

    def test_accepts_valid_submission(self):
        from app.schemas import ReportSubmission
        r = ReportSubmission(lat=19.068, lng=72.875, text="Flooding on main road", depth_hint="knee")
        assert r.lat == 19.068
        assert r.depth_hint == "knee"


# ── Phase 4b: Translation ─────────────────────────────────────────────────────

class TestTranslation:
    @pytest.mark.asyncio
    async def test_fallback_returns_all_three_languages(self):
        """LLM failure (no key) must return en/hi/mr from hardcoded templates."""
        from app.services.translate import translate_alert
        with patch("app.services.translate.is_groq_available", return_value=False):
            result = await translate_alert(
                message_en="CRITICAL FLOOD ALERT for Kurla West.",
                tier="critical",
                zone="Kurla West",
                avoid="LBS Marg",
                shelter="Kurla Municipal School",
            )
        assert "en" in result
        assert "hi" in result
        assert "mr" in result
        assert len(result["en"]) > 0
        assert len(result["hi"]) > 0
        assert len(result["mr"]) > 0

    @pytest.mark.asyncio
    async def test_all_messages_under_300_chars(self):
        from app.services.translate import translate_alert
        with patch("app.services.translate.is_groq_available", return_value=False):
            result = await translate_alert(
                message_en="FLOOD WARNING for Dharavi. Water levels rising.",
                tier="warning",
                zone="Dharavi",
                avoid="Sion-Dharavi Road",
                shelter="Dharavi Community Centre",
            )
        for lang, msg in result.items():
            assert len(msg) <= 300, f"{lang} message exceeds 300 chars: {len(msg)}"

    @pytest.mark.asyncio
    async def test_llm_failure_falls_back_gracefully(self):
        """Even if Groq key is set but call fails, fallback templates are returned."""
        from app.services.translate import translate_alert
        with patch("app.services.translate.is_groq_available", return_value=True):
            with patch("app.services.translate.chat_completion", new_callable=AsyncMock, return_value=None):
                result = await translate_alert(
                    message_en="WATCH: Monitor Sion for rising water.",
                    tier="watch",
                    zone="Sion",
                )
        assert "hi" in result
        assert "mr" in result

    @pytest.mark.asyncio
    async def test_placeholder_substitution_in_fallback(self):
        from app.services.translate import translate_alert
        with patch("app.services.translate.is_groq_available", return_value=False):
            result = await translate_alert(
                message_en="Test alert.",
                tier="critical",
                zone="Kurla West",
                avoid="LBS Marg",
                shelter="Shelter Alpha",
            )
        # Placeholders must be replaced in all languages
        for lang, msg in result.items():
            assert "{zone}" not in msg
            assert "{avoid}" not in msg
            assert "{shelter}" not in msg
