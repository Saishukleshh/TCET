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
        setMsg(`✓ Successfully assigned Team #${res.assignments[0].team_id} (ETA ~${res.assignments[0].eta_min} min)`);
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
      setMsg("✓ Emergency Alert broadcast sent to citizens & emergency responders.");
    } catch (err) {
      setMsg("Alert broadcast failed.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--surface-base)",
        color: "var(--color-branco)",
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
          borderBottom: "2px solid var(--surface-border)",
          paddingBottom: "var(--space-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/incidents"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              color: colors.amareloNeon,
              textDecoration: "none",
            }}
          >
            ← ALL INCIDENTS
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: colors.rosaNeon }}>
            INCIDENT #{id.slice(0, 8)}
          </span>
        </div>

        <Link
          href="/command"
          style={{
            fontFamily: "var(--font-display)",
            padding: "6px 14px",
            background: colors.amareloNeon,
            color: "#000",
            textDecoration: "none",
            border: "2px solid #000",
            boxShadow: "2px 2px 0 #000",
          }}
        >
          OPEN COMMAND MAP →
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, opacity: 0.6 }}>Loading incident #{id}...</div>
      ) : !incident ? (
        <div style={{ textAlign: "center", padding: 60, opacity: 0.6 }}>Incident not found.</div>
      ) : (
        <div>
          {msg && (
            <div
              style={{
                background: "rgba(0, 255, 0, 0.15)",
                border: `2px solid ${colors.verdeNeon}`,
                color: colors.verdeNeon,
                padding: "10px 16px",
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
              }}
            >
              {msg}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
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
                background: "var(--surface-overlay)",
                border: "2px solid var(--surface-border)",
                height: 480,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  background: "var(--surface-card)",
                  borderBottom: "1px solid var(--surface-border)",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                }}
              >
                INCIDENT GEOLOCATION & NEARBY RESOURCES
              </div>
              <div style={{ flex: 1, position: "relative" }}>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
