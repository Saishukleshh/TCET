"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import EventTimeline, { TimelineEvent } from "@/components/EventTimeline";
import { useEvents } from "@/hooks/use-events";
import {
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
          // Default to highest risk zone
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

    // Push to timeline
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
      case "alert.sent":
      case "alert.rejected": {
        setPendingAlerts((prev) => prev.filter((a) => a.id !== payload.id));
        break;
      }
      case "resource.assigned": {
        // Refresh teams
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

  const { status: wsStatus } = useEvents(handleWsMessage);

  // Alert actions
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

  // Team allocation
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

  // Rain slider
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
        background: "var(--surface-base)",
        color: "var(--color-branco)",
        overflow: "hidden",
      }}
    >
      {/* ── Top Header ────────────────────────────────────────── */}
      <header
        style={{
          background: "var(--surface-overlay)",
          borderBottom: "2px solid var(--surface-border)",
          padding: "var(--space-1) var(--space-3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        {/* Brand & Tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontFamily: "var(--font-accent)",
                fontSize: "1.75rem",
                color: colors.amareloNeon,
                letterSpacing: "0.08em",
                textShadow: "3px 3px 0 #000",
              }}
            >
              AEGISFLOW
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                color: colors.rosaNeon,
                letterSpacing: "0.15em",
              }}
            >
              // COMMAND OPERATIONAL PICTURE
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", gap: 6, marginLeft: 20 }}>
            {[
              { href: "/command", label: "COMMAND", active: true },
              { href: "/incidents", label: "INCIDENTS" },
              { href: "/resources", label: "RESOURCES" },
              { href: "/responder", label: "RESPONDER" },
              { href: "/report", label: "CITIZEN REPORT" },
              { href: "/simulate", label: "SIMULATOR" },
            ].map((nav) => (
              <Link
                key={nav.href}
                href={nav.href}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  padding: "4px 10px",
                  background: nav.active ? colors.amareloNeon : "var(--surface-card)",
                  color: nav.active ? "#000" : "var(--color-branco)",
                  border: nav.active ? "2px solid #000" : "1px solid var(--surface-border)",
                  boxShadow: nav.active ? "2px 2px 0 #000" : "none",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                }}
              >
                {nav.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Status Indicators & Rain Quick-Control */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Rainfall quick pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface-card)",
              border: `1px solid ${colors.azulFosco}`,
              padding: "4px 12px",
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>🌧</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: colors.azulFosco,
                fontWeight: 700,
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
              style={{ width: 80, cursor: "pointer", accentColor: colors.azulFosco }}
              title="Drag to test dynamic rainfall"
            />
          </div>

          {/* Active stats badge */}
          <div style={{ display: "flex", gap: 8, fontSize: "0.75rem" }}>
            <span
              style={{
                background: "rgba(255, 0, 0, 0.15)",
                border: `1px solid ${colors.vermelho}`,
                color: colors.vermelho,
                padding: "2px 8px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
              }}
            >
              {incidents.length} INCIDENTS
            </span>
            <span
              style={{
                background: "rgba(255, 16, 240, 0.15)",
                border: `1px solid ${colors.rosaNeon}`,
                color: colors.rosaNeon,
                padding: "2px 8px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
              }}
            >
              {teams.filter((t) => t.status === "available").length}/{teams.length} TEAMS READY
            </span>
          </div>

          {/* WebSocket Pulse */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.7rem",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  wsStatus === "connected"
                    ? colors.verdeNeon
                    : wsStatus === "connecting"
                    ? colors.amareloNeon
                    : colors.vermelho,
                boxShadow:
                  wsStatus === "connected"
                    ? `0 0 8px ${colors.verdeNeon}`
                    : "none",
              }}
            />
            <span style={{ opacity: 0.7 }}>
              {wsStatus === "connected" ? "LIVE TELEMETRY" : wsStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Workspace ────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
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
              background: "rgba(17, 17, 17, 0.92)",
              backdropFilter: "blur(6px)",
              border: "2px solid #000",
              boxShadow: "4px 4px 0 #000",
              padding: "8px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
            }}
          >
            <div style={{ opacity: 0.6, fontSize: "0.65rem", marginBottom: 2 }}>MAP LAYERS</div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => setShowZones(e.target.checked)}
                style={{ accentColor: colors.amareloNeon }}
              />
              <span style={{ color: colors.amareloNeon }}>Risk Zones</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showIncidents}
                onChange={(e) => setShowIncidents(e.target.checked)}
                style={{ accentColor: colors.vermelho }}
              />
              <span style={{ color: colors.vermelho }}>Incidents</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showShelters}
                onChange={(e) => setShowShelters(e.target.checked)}
                style={{ accentColor: colors.azulFosco }}
              />
              <span style={{ color: colors.azulFosco }}>Shelters</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showTeams}
                onChange={(e) => setShowTeams(e.target.checked)}
                style={{ accentColor: colors.rosaNeon }}
              />
              <span style={{ color: colors.rosaNeon }}>Response Teams</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showBlocked}
                onChange={(e) => setShowBlocked(e.target.checked)}
                style={{ accentColor: colors.vermelho }}
              />
              <span style={{ color: colors.vermelho }}>Blocked Roads</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showRoute}
                onChange={(e) => setShowRoute(e.target.checked)}
                style={{ accentColor: colors.verdeNeon }}
              />
              <span style={{ color: colors.verdeNeon }}>Safe Evacuation Route</span>
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
          style={{
            width: 420,
            background: "var(--surface-overlay)",
            borderLeft: "2px solid var(--surface-border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 15,
          }}
        >
          {/* Panel Tab Bar */}
          <div
            style={{
              display: "flex",
              borderBottom: "2px solid var(--surface-border)",
              background: "var(--surface-card)",
            }}
          >
            <button
              onClick={() => setActiveTab("queue")}
              style={{
                flex: 1,
                padding: "10px 8px",
                fontFamily: "var(--font-display)",
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                background: activeTab === "queue" ? "var(--surface-overlay)" : "transparent",
                color: activeTab === "queue" ? colors.amareloNeon : "var(--color-branco)",
                border: "none",
                borderBottom: activeTab === "queue" ? `3px solid ${colors.amareloNeon}` : "none",
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
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                background: activeTab === "risk" ? "var(--surface-overlay)" : "transparent",
                color: activeTab === "risk" ? colors.laranja : "var(--color-branco)",
                border: "none",
                borderBottom: activeTab === "risk" ? `3px solid ${colors.laranja}` : "none",
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
                  fontSize: "0.8rem",
                  letterSpacing: "0.06em",
                  background: activeTab === "evidence" ? "var(--surface-overlay)" : "transparent",
                  color: activeTab === "evidence" ? colors.verdeNeon : "var(--color-branco)",
                  border: "none",
                  borderBottom: activeTab === "evidence" ? `3px solid ${colors.verdeNeon}` : "none",
                  cursor: "pointer",
                }}
              >
                EVIDENCE
              </button>
            )}
          </div>

          {/* Panel Content Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-2)" }}>
            {activeTab === "queue" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      color: "var(--color-branco)",
                      opacity: 0.6,
                      letterSpacing: "0.05em",
                    }}
                  >
                    PRIORITIZED TRIAGE QUEUE
                  </span>
                  <button
                    onClick={handleAllocateTeams}
                    style={{
                      background: colors.rosaNeon,
                      color: "#000",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "4px 8px",
                      border: "1px solid #000",
                      boxShadow: "2px 2px 0 #000",
                      cursor: "pointer",
                    }}
                  >
                    ⚡ AUTO-ALLOCATE TEAMS
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
                      fontSize: "0.75rem",
                      opacity: 0.6,
                      marginBottom: 6,
                    }}
                  >
                    ALL NEIGHBOURHOOD ZONES
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
                            padding: "6px 10px",
                            background: isSel ? "var(--surface-card)" : "rgba(255,255,255,0.02)",
                            borderLeft: `4px solid ${
                              r >= 0.7
                                ? colors.vermelho
                                : r >= 0.45
                                ? colors.laranja
                                : r >= 0.25
                                ? colors.amareloNeon
                                : colors.verdeNeon
                            }`,
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.8rem",
                          }}
                        >
                          <span>{z.properties.name}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
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
                    const alert = await (
                      await import("@/lib/api-client")
                    ).apiFetch<any>("/alerts/", {
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
