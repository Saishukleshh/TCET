"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { colors, severityColor, confidenceColor } from "@/lib/design-tokens";
import { fetchIncident, allocateResources, approveAlert } from "@/lib/api-client";
import EvidencePanel, { IncidentDetail } from "@/components/EvidencePanel";
import MapView from "@/components/MapView";

interface Props {
  params: Promise<{ id: string }>;
}

export default function IncidentDetailPage({ params }: Props) {
  const { id } = use(params);
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchIncident(id)
      .then((data) => setIncident(data))
      .catch((err) => console.error("Error loading incident", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAllocate = async (incId: string) => {
    try {
      setMsg("Allocating response teams via Hungarian optimization...");
      const res = await allocateResources([incId]);
      if (res.assignments?.length) {
        setMsg(`[ASSIGNED] Team #${res.assignments[0].team_id} dispatched (ETA ~${res.assignments[0].eta_min} min)`);
      } else {
        setMsg("No available teams to assign at this moment.");
      }
      const updated = await fetchIncident(id);
      setIncident(updated);
    } catch (err) {
      setMsg("Allocation failed. Check backend connection.");
    }
  };

  const handleAlert = async (incId: string) => {
    try {
      setMsg("Broadcasting public flood alert for zone...");
      const { apiFetch } = await import("@/lib/api-client");
      const alert = await apiFetch<any>("/alerts/", {
        method: "POST",
        body: JSON.stringify({
          tier: incident?.severity ?? "warning",
          zone_id: "zone-001",
          message: `URGENT FLOOD ALERT: Severe waterlogging at Incident #${incId.slice(0, 8)}. Immediate evacuation advised.`,
        }),
      });
      await approveAlert(alert.id, "Incident Detail Officer");
      setMsg("[TRANSMITTED] Emergency Alert broadcast sent to citizens & emergency responders.");
    } catch (err) {
      setMsg("Alert broadcast failed.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: colors.washi,
        color: colors.ink,
        padding: "var(--space-4)",
      }}
    >
      {/* Top breadcrumb navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-3)",
          borderBottom: `2px solid ${colors.ink}`,
          paddingBottom: "var(--space-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/incidents"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: colors.indigo,
              textDecoration: "none",
            }}
          >
            ← ALL INCIDENTS
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: colors.vermilion,
              fontWeight: 700,
            }}
          >
            INCIDENT #{id.slice(0, 8)}
          </span>
        </div>

        <Link
          href="/command"
          style={{
            fontFamily: "var(--font-display)",
            padding: "8px 16px",
            background: colors.vermilion,
            color: colors.washi,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.85rem",
            border: `2px solid ${colors.ink}`,
            boxShadow: `2px 2px 0 ${colors.ink}`,
            letterSpacing: "0.06em",
          }}
        >
          OPEN COMMAND MAP →
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, fontFamily: "var(--font-display)", color: colors.indigo }}>
          Loading incident #{id}...
        </div>
      ) : !incident ? (
        <div style={{ textAlign: "center", padding: 60, fontFamily: "var(--font-display)", color: colors.vermilion }}>
          Incident not found.
        </div>
      ) : (
        <div>
          {msg && (
            <div
              style={{
                background: colors.washiCard,
                border: `2px solid ${colors.pine}`,
                color: colors.pine,
                padding: "10px 16px",
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                boxShadow: `3px 3px 0 ${colors.ink}`,
                fontWeight: 600,
              }}
            >
              {msg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Evidence & Action Panel */}
            <div>
              <EvidencePanel
                incident={incident}
                onAllocateTeam={handleAllocate}
                onTriggerAlert={handleAlert}
              />
            </div>

            {/* Right: Geographic Context Mini-Map */}
            <div
              style={{
                background: colors.washiCard,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
                height: 520,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  background: colors.surface,
                  borderBottom: `2px solid ${colors.ink}`,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: colors.washi,
                  letterSpacing: "0.06em",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>GEOGRAPHIC CONTEXT & NEARBY STATIONS</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: colors.ochre,
                  }}
                >
                  {incident.lat != null && incident.lng != null
                    ? `${incident.lat.toFixed(4)}°N, ${incident.lng.toFixed(4)}°E`
                    : "N/A"}
                </span>
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                {incident.lat != null && incident.lng != null ? (
                  <MapView
                    incidents={[
                      {
                        id: incident.id,
                        lat: incident.lat,
                        lng: incident.lng,
                        severity: incident.severity,
                        status: incident.status,
                        confidence: incident.confidence,
                        report_count: incident.report_count,
                      },
                    ]}
                    center={[incident.lng, incident.lat]}
                    zoom={14.5}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#888",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                    }}
                  >
                    NO COORDINATES AVAILABLE
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
