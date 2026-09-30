"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { colors } from "@/lib/design-tokens";
import MapView, {
  ZoneFeature,
  IncidentMarker,
  ShelterMarker,
  TeamMarker,
  BlockedRoad,
  RouteGeoJSON,
} from "@/components/MapView";
import IncidentQueue from "@/components/IncidentQueue";
import RiskExplain from "@/components/RiskExplain";
import EvidencePanel, { IncidentDetail } from "@/components/EvidencePanel";
import ApprovalCard, { PendingAlert } from "@/components/ApprovalCard";
import type { AlertTranslations } from "@/components/PhonePreview";
import EventTimeline, { TimelineEvent } from "@/components/EventTimeline";
import { useEvents } from "@/hooks/use-events";
import {
  apiFetch,
  fetchZoneRisk,
  fetchIncidents,
  fetchIncident,
  fetchShelters,
  fetchTeams,
  fetchAlerts,
  fetchEvents,
  approveAlert,
  rejectAlert,
  allocateResources,
  simulateRain,
} from "@/lib/api-client";
import type { WsMessage } from "@aegisflow/shared";

export default function CommandPage() {
  // State
  const [zones, setZones] = useState<ZoneFeature[]>([]);
  const [incidents, setIncidents] = useState<IncidentMarker[]>([]);
  const [shelters, setShelters] = useState<ShelterMarker[]>([]);
  const [teams, setTeams] = useState<TeamMarker[]>([]);
  const [blockedRoads, setBlockedRoads] = useState<BlockedRoad[]>([]);
  const [evacRoute, setEvacRoute] = useState<RouteGeoJSON | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [pendingAlerts, setPendingAlerts] = useState<PendingAlert[]>([]);

  // Selected details
  const [selectedZone, setSelectedZone] = useState<ZoneFeature | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<IncidentDetail | null>(null);

  // Weather / Rain controls
  const [rainIntensity, setRainIntensity] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"queue" | "risk" | "evidence">("queue");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  // Layer toggles
  const [showZones, setShowZones] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showTeams, setShowTeams] = useState(true);
  const [showBlocked, setShowBlocked] = useState(true);
  const [showRoute, setShowRoute] = useState(true);

  // Initial load
  const loadInitialData = useCallback(async () => {
    try {
      const [zRes, iRes, sRes, tRes, aRes, eRes] = await Promise.allSettled([
        fetchZoneRisk(),
        fetchIncidents(),
        fetchShelters(),
        fetchTeams(),
        fetchAlerts(),
        fetchEvents(),
      ]);

      if (zRes.status === "fulfilled" && zRes.value.features) {
        setZones(zRes.value.features);
        if (zRes.value.features.length > 0) {
          const sorted = [...zRes.value.features].sort(
            (a, b) => (b.properties.risk ?? 0) - (a.properties.risk ?? 0)
          );
          setSelectedZone(sorted[0]);
          setRainIntensity(sorted[0].properties.rainfall_mm_h ?? 0);
        }
      }

      if (iRes.status === "fulfilled" && Array.isArray(iRes.value)) {
        setIncidents(iRes.value);
      }

      if (sRes.status === "fulfilled" && Array.isArray(sRes.value)) {
        setShelters(sRes.value);
      }

      if (tRes.status === "fulfilled" && Array.isArray(tRes.value)) {
        setTeams(tRes.value);
      }

      if (aRes.status === "fulfilled" && Array.isArray(aRes.value)) {
        setPendingAlerts(aRes.value.filter((a: any) => a.status === "pending"));
      }

      if (eRes.status === "fulfilled" && Array.isArray(eRes.value)) {
        setEvents(eRes.value);
      }
    } catch (err) {
      console.error("[Command] Initial fetch error", err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load selected incident details
  useEffect(() => {
    if (!selectedIncidentId) {
      setSelectedIncidentDetail(null);
      return;
    }
    fetchIncident(selectedIncidentId)
      .then((detail) => {
        setSelectedIncidentDetail(detail);
        setActiveTab("evidence");
      })
      .catch((e) => console.warn("Failed to load incident detail", e));
  }, [selectedIncidentId]);

  // WebSocket message handler
  const handleWsMessage = useCallback((msg: WsMessage) => {
    const { kind } = msg;
    const payload = msg.payload as any;

    setEvents((prev) => [{ ts: new Date().toISOString(), kind, payload }, ...prev.slice(0, 50)]);

    switch (kind) {
      case "rain.updated": {
        const mm = Number(payload.intensity_mm_h ?? 0);
        setRainIntensity(mm);
        break;
      }
      case "risk.updated": {
        if (payload.zones && Array.isArray(payload.zones)) {
          setZones((prev) =>
            prev.map((z) => {
              const match = payload.zones.find((pz: any) => pz.zone_id === z.properties.id);
              if (match) {
                return {
                  ...z,
                  properties: {
                    ...z.properties,
                    ...match,
                  },
                };
              }
              return z;
            })
          );
        }
        break;
      }
      case "incident.created":
      case "incident.updated": {
        const item: IncidentMarker = {
          id: payload.id,
          lat: payload.lat ?? payload.geom?.coordinates?.[1] ?? 19.068,
          lng: payload.lng ?? payload.geom?.coordinates?.[0] ?? 72.875,
          severity: payload.severity ?? "watch",
          status: payload.status ?? "unverified",
          confidence: payload.confidence ?? 0,
          report_count: payload.report_count ?? 1,
          created_at: payload.created_at,
          recommended_action: payload.recommended_action,
        };

        setIncidents((prev) => {
          const idx = prev.findIndex((i) => i.id === item.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = item;
            return next;
          }
          return [item, ...prev];
        });
        break;
      }
      case "road.blocked": {
        setBlockedRoads((prev) => [
          ...prev,
          {
            id: payload.road_id,
            geom: payload.geom,
            reason: "flooding",
          },
        ]);
        break;
      }
      case "route.recalculated": {
        if (payload.geom) {
          setEvacRoute(payload.geom);
        }
        break;
      }
      case "alert.pending": {
        setPendingAlerts((prev) => {
          if (prev.some((a) => a.id === payload.id)) return prev;
          return [payload as PendingAlert, ...prev];
        });
        break;
      }
      case "alert.approved": {
        // Update the alert in the pending list with translations so PhonePreview appears
        setPendingAlerts((prev) =>
          prev.map((a) =>
            a.id === payload.id
              ? { ...a, status: "approved", translations: payload.translations ?? null }
              : a
          )
        );
        break;
      }
      case "alert.sent":
      case "alert.rejected": {
        setPendingAlerts((prev) => prev.filter((a) => a.id !== payload.id));
        break;
      }
      case "resource.assigned": {
        fetchTeams().then((t) => Array.isArray(t) && setTeams(t));
        break;
      }
      case "simulate.reset": {
        loadInitialData();
        setBlockedRoads([]);
        setEvacRoute(null);
        break;
      }
    }
  }, [loadInitialData]);

  const { status: wsStatus, reconnect } = useEvents(handleWsMessage);

  const handleApproveAlert = async (alertId: string) => {
    try {
      await approveAlert(alertId, "Command Center");
      setPendingAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error("Failed to approve alert", err);
    }
  };

  const handleRejectAlert = async (alertId: string) => {
    try {
      await rejectAlert(alertId, "Command Center");
      setPendingAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error("Failed to reject alert", err);
    }
  };

  const handleAllocateTeams = async () => {
    const ids = incidents.map((i) => i.id);
    if (!ids.length) return;
    try {
      await allocateResources(ids);
      const updated = await fetchTeams();
      if (Array.isArray(updated)) setTeams(updated);
    } catch (err) {
      console.error("Failed to allocate resources", err);
    }
  };

  const handleRainChange = async (mm: number) => {
    setRainIntensity(mm);
    try {
      await simulateRain(mm);
    } catch (err) {
      console.error("Failed to set rain", err);
    }
  };

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: colors.washi,
        color: colors.ink,
        overflow: "hidden",
      }}
    >
      {/* ── Top Header Bar ────────────────────────────────────── */}
      <header
        style={{
          background: colors.washiCard,
          borderBottom: `2.5px solid ${colors.ink}`,
          padding: "8px 16px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          zIndex: 100,
        }}
      >
        {/* Brand & Hanko Seal */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                fontWeight: 900,
                color: colors.ink,
                letterSpacing: "0.08em",
              }}
            >
              AEGISFLOW
            </span>
            <span
              style={{
                border: `2px solid ${colors.vermilion}`,
                color: colors.vermilion,
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                fontWeight: 800,
                padding: "1px 6px",
                letterSpacing: "0.1em",
              }}
            >
              COMMAND
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 6, overflowX: "auto" }}>
            {[
              { href: "/command", label: "COMMAND", active: true },
              { href: "/incidents", label: "INCIDENTS" },
              { href: "/resources", label: "RESOURCES" },
              { href: "/responder", label: "RESPONDER" },
              { href: "/report", label: "CITIZEN PORTAL" },
              { href: "/simulate", label: "SIMULATOR" },
            ].map((nav) => (
              <Link
                key={nav.href}
                href={nav.href}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  padding: "5px 10px",
                  background: nav.active ? colors.vermilion : colors.washiMuted,
                  color: nav.active ? "#FAF4E8" : colors.ink,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: nav.active ? `2px 2px 0 ${colors.ink}` : "none",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                  whiteSpace: "nowrap",
                }}
              >
                {nav.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Status Indicators & Rain Quick-Control */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          {/* Rainfall quick pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: colors.washiMuted,
              border: `2px solid ${colors.ink}`,
              boxShadow: `2px 2px 0 ${colors.ink}`,
              padding: "4px 12px",
            }}
          >
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-display)", fontWeight: 700, color: colors.prussian }}>
              PRECIP:
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: colors.prussian,
                fontWeight: 800,
              }}
            >
              {rainIntensity.toFixed(1)} mm/h
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={rainIntensity}
              onChange={(e) => handleRainChange(Number(e.target.value))}
              style={{ width: 75, cursor: "pointer", accentColor: colors.prussian }}
              title="Test dynamic precipitation"
            />
          </div>

          {/* Active stats badge */}
          <div style={{ display: "flex", gap: 8, fontSize: "0.75rem" }}>
            <span
              style={{
                background: colors.washiMuted,
                border: `2px solid ${colors.ink}`,
                color: colors.vermilion,
                padding: "3px 8px",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                boxShadow: `2px 2px 0 ${colors.ink}`,
              }}
            >
              {incidents.length} INCIDENTS
            </span>
            <span
              style={{
                background: colors.washiMuted,
                border: `2px solid ${colors.ink}`,
                color: colors.pine,
                padding: "3px 8px",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                boxShadow: `2px 2px 0 ${colors.ink}`,
              }}
            >
              {teams.filter((t) => t.status === "available").length}/{teams.length} UNITS READY
            </span>
          </div>

          {/* Telemetry Pulse */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.75rem",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background:
                  wsStatus === "connected"
                    ? colors.pine
                    : wsStatus === "connecting"
                    ? colors.ochre
                    : colors.vermilion,
                border: `1px solid ${colors.ink}`,
              }}
            />
            <span style={{ opacity: 0.8 }}>
              {wsStatus === "connected" ? "LIVE TELEMETRY" : wsStatus.toUpperCase()}
            </span>
          </div>

          {/* Mobile Panel Toggle */}
          <button
            onClick={() => setMobilePanelOpen((prev) => !prev)}
            className="md:hidden"
            style={{
              background: mobilePanelOpen ? colors.vermilion : colors.washiMuted,
              color: mobilePanelOpen ? "#FAF4E8" : colors.ink,
              border: `2px solid ${colors.ink}`,
              boxShadow: `2px 2px 0 ${colors.ink}`,
              padding: "4px 10px",
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {mobilePanelOpen ? "SHOW MAP" : "SHOW PANEL"}
          </button>
        </div>
      </header>

      {/* ── Offline Reconnection Status Banner ──────────────────── */}
      {wsStatus !== "connected" && (
        <div
          style={{
            background: wsStatus === "connecting" ? colors.ochre : colors.vermilion,
            color: "#FAF4E8",
            padding: "5px 16px",
            fontSize: "0.75rem",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `2px solid ${colors.ink}`,
            zIndex: 90,
          }}
        >
          <span>
            {wsStatus === "connecting"
              ? "CONNECTING TO LIVE TELEMETRY GRID..."
              : "TELEMETRY DISCONNECTED · REAL-TIME EVENTS PAUSED"}
          </span>
          <button
            onClick={reconnect}
            style={{
              background: colors.washiCard,
              color: colors.ink,
              border: `1.5px solid ${colors.ink}`,
              padding: "2px 8px",
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            RECONNECT
          </button>
        </div>
      )}

      {/* ── Main Workspace ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-1 relative overflow-hidden">
        {/* Left Map Area */}
        <div style={{ flex: 1, position: "relative", height: "100%" }}>
          <MapView
            zones={zones}
            incidents={incidents}
            shelters={shelters}
            teams={teams}
            blockedRoads={blockedRoads}
            route={evacRoute}
            showZones={showZones}
            showIncidents={showIncidents}
            showShelters={showShelters}
            showTeams={showTeams}
            showBlockedRoads={showBlocked}
            showRoute={showRoute}
            onSelectZone={(z) => {
              setSelectedZone(z);
              setActiveTab("risk");
            }}
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              setActiveTab("evidence");
            }}
          />

          {/* Floating Map Layer Toggles */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 10,
              background: colors.washiCard,
              border: `2.5px solid ${colors.ink}`,
              boxShadow: `4px 4px 0 ${colors.ink}`,
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontFamily: "var(--font-display)",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            <div style={{ opacity: 0.6, fontSize: "0.7rem", marginBottom: 2, borderBottom: `1px solid ${colors.ink}`, paddingBottom: 2 }}>
              CARTOGRAPHIC LAYERS
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => setShowZones(e.target.checked)}
                style={{ accentColor: colors.ochre }}
              />
              <span style={{ color: colors.ochre }}>Vulnerability Zones</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showIncidents}
                onChange={(e) => setShowIncidents(e.target.checked)}
                style={{ accentColor: colors.vermilion }}
              />
              <span style={{ color: colors.vermilion }}>Incident Clusters</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showShelters}
                onChange={(e) => setShowShelters(e.target.checked)}
                style={{ accentColor: colors.prussian }}
              />
              <span style={{ color: colors.prussian }}>Evacuation Shelters</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showTeams}
                onChange={(e) => setShowTeams(e.target.checked)}
                style={{ accentColor: colors.indigo }}
              />
              <span style={{ color: colors.indigo }}>Field Response Teams</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showBlocked}
                onChange={(e) => setShowBlocked(e.target.checked)}
                style={{ accentColor: colors.vermilion }}
              />
              <span style={{ color: colors.vermilion }}>Impassable Hazards</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showRoute}
                onChange={(e) => setShowRoute(e.target.checked)}
                style={{ accentColor: colors.pine }}
              />
              <span style={{ color: colors.pine }}>Safe Evacuation Corridor</span>
            </label>
          </div>

          {/* Pending Alerts Banner Overlay */}
          {pendingAlerts.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 20,
                width: 380,
                maxWidth: "calc(100% - 32px)",
              }}
            >
              <ApprovalCard
                alert={pendingAlerts[0]}
                onApprove={handleApproveAlert}
                onReject={handleRejectAlert}
              />
            </div>
          )}
        </div>

        {/* Right Operations Panel */}
        <aside
          className={`${mobilePanelOpen ? "flex" : "hidden"} md:flex`}
          style={{
            width: "clamp(320px, 35vw, 440px)",
            maxWidth: "100%",
            background: colors.washiCard,
            borderLeft: `2.5px solid ${colors.ink}`,
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 15,
          }}
        >
          {/* Panel Tab Bar */}
          <div
            style={{
              display: "flex",
              borderBottom: `2.5px solid ${colors.ink}`,
              background: colors.washiMuted,
            }}
          >
            <button
              onClick={() => setActiveTab("queue")}
              style={{
                flex: 1,
                padding: "10px 8px",
                fontFamily: "var(--font-display)",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                background: activeTab === "queue" ? colors.washiCard : "transparent",
                color: activeTab === "queue" ? colors.vermilion : colors.ink,
                border: "none",
                borderBottom: activeTab === "queue" ? `3px solid ${colors.vermilion}` : "none",
                cursor: "pointer",
              }}
            >
              INCIDENTS ({incidents.length})
            </button>

            <button
              onClick={() => setActiveTab("risk")}
              style={{
                flex: 1,
                padding: "10px 8px",
                fontFamily: "var(--font-display)",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                background: activeTab === "risk" ? colors.washiCard : "transparent",
                color: activeTab === "risk" ? colors.ochre : colors.ink,
                border: "none",
                borderBottom: activeTab === "risk" ? `3px solid ${colors.ochre}` : "none",
                cursor: "pointer",
              }}
            >
              RISK MATRIX
            </button>

            {selectedIncidentDetail && (
              <button
                onClick={() => setActiveTab("evidence")}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  background: activeTab === "evidence" ? colors.washiCard : "transparent",
                  color: activeTab === "evidence" ? colors.pine : colors.ink,
                  border: "none",
                  borderBottom: activeTab === "evidence" ? `3px solid ${colors.pine}` : "none",
                  cursor: "pointer",
                }}
              >
                EVIDENCE
              </button>
            )}
          </div>

          {/* Panel Content Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-2)", background: colors.washi }}>
            {activeTab === "queue" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      color: colors.ink,
                      opacity: 0.7,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    TRIAGE QUEUE
                  </span>
                  <button
                    onClick={handleAllocateTeams}
                    style={{
                      background: colors.indigo,
                      color: "#FAF4E8",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "6px 10px",
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                      cursor: "pointer",
                    }}
                  >
                    DISPATCH OPTIMIZER
                  </button>
                </div>

                <IncidentQueue
                  incidents={incidents}
                  selectedId={selectedIncidentId ?? undefined}
                  onSelect={(id) => {
                    setSelectedIncidentId(id);
                    setActiveTab("evidence");
                  }}
                />
              </div>
            )}

            {activeTab === "risk" && selectedZone && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <RiskExplain
                  zoneId={selectedZone.properties.id}
                  zoneName={selectedZone.properties.name}
                  risk={selectedZone.properties.risk ?? 0}
                  factors={
                    selectedZone.properties.factors ?? {
                      rain_norm: 0,
                      low_elevation: 0,
                      history: 0,
                      incident_density: 0,
                    }
                  }
                  rainfallMmH={selectedZone.properties.rainfall_mm_h ?? rainIntensity}
                  populationExposed={selectedZone.properties.population_exposed ?? 0}
                />

                {/* Zone selector list */}
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      opacity: 0.7,
                      marginBottom: 6,
                    }}
                  >
                    MUMBAI SECTOR INDEX
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {zones.map((z) => {
                      const isSel = selectedZone?.properties.id === z.properties.id;
                      const r = z.properties.risk ?? 0;
                      return (
                        <div
                          key={z.properties.id}
                          onClick={() => setSelectedZone(z)}
                          style={{
                            padding: "8px 10px",
                            background: isSel ? colors.washiMuted : colors.washiCard,
                            borderLeft: `5px solid ${
                              r >= 0.7
                                ? colors.vermilion
                                : r >= 0.45
                                ? colors.ochre
                                : r >= 0.25
                                ? colors.indigo
                                : colors.pine
                            }`,
                            borderTop: `1px solid ${colors.ink}`,
                            borderRight: `1px solid ${colors.ink}`,
                            borderBottom: `1px solid ${colors.ink}`,
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            boxShadow: isSel ? `2px 2px 0 ${colors.ink}` : "none",
                          }}
                        >
                          <span>{z.properties.name}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800 }}>
                            {(r * 100).toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "evidence" && selectedIncidentDetail && (
              <EvidencePanel
                incident={selectedIncidentDetail}
                onAllocateTeam={handleAllocateTeams}
                onTriggerAlert={async (iid) => {
                  try {
                    const alert = await apiFetch<any>("/alerts/", {
                      method: "POST",
                      body: JSON.stringify({
                        tier: selectedIncidentDetail.severity,
                        zone_id: "zone-001",
                        message: `Emergency Alert: Severe waterlogging confirmed near incident #${iid.slice(
                          0,
                          6
                        )}. Evacuation in progress.`,
                      }),
                    });
                    setPendingAlerts((prev) => [alert, ...prev]);
                  } catch (e) {
                    console.error("Failed to trigger alert", e);
                  }
                }}
                onClose={() => setActiveTab("queue")}
              />
            )}
          </div>
        </aside>
      </div>

      {/* ── Bottom Event Timeline ─────────────────────────────── */}
      <EventTimeline events={events} />
    </div>
  );
}
