"use client";

import { colors, severityColor, confidenceColor } from "@/lib/design-tokens";

export interface IncidentDetail {
  id: string;
  severity: "critical" | "warning" | "watch";
  status: "verified" | "probable" | "unverified";
  confidence: number;
  report_count: number;
  lat: number;
  lng: number;
  created_at: string;
  updated_at?: string;
  recommended_action?: string;
  assigned_team_id?: string | null;
  evidence?: {
    report_count: number;
    image_result?: {
      shows_flooding: boolean;
      depth_estimate?: string | null;
      confidence: number;
      model_used: string;
    } | null;
    rainfall_mm_h?: number;
    sources?: string[];
  };
}

interface EvidencePanelProps {
  incident: IncidentDetail;
  onAllocateTeam?: (incidentId: string) => void;
  onTriggerAlert?: (incidentId: string) => void;
  onClose?: () => void;
}

export default function EvidencePanel({
  incident,
  onAllocateTeam,
  onTriggerAlert,
  onClose,
}: EvidencePanelProps) {
  const sevCol = severityColor[incident.severity] ?? colors.vermelho;
  const confCol = confidenceColor[incident.status] ?? colors.branco;
  const imgResult = incident.evidence?.image_result;

  return (
    <div
      style={{
        background: "var(--surface-overlay)",
        border: `3px solid ${sevCol}`,
        boxShadow: "5px 5px 0 #000000",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid var(--surface-border)",
          paddingBottom: "var(--space-1)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                color: sevCol,
                letterSpacing: "0.06em",
              }}
            >
              INCIDENT #{incident.id.slice(0, 8)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                background: sevCol,
                color: "#000",
                fontWeight: 800,
                padding: "1px 6px",
              }}
            >
              {incident.severity.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-branco)", opacity: 0.6 }}>
            Coordinates: {incident.lat.toFixed(4)}°N, {incident.lng.toFixed(4)}°E
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-branco)",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Verification status & confidence */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--surface-card)",
          padding: "8px 12px",
          border: "1px solid var(--surface-border)",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.65rem", color: "var(--color-branco)", opacity: 0.7 }}>
            VERIFICATION STATUS
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: confCol,
              letterSpacing: "0.05em",
            }}
          >
            {incident.status.toUpperCase()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.65rem", color: "var(--color-branco)", opacity: 0.7 }}>
            AI CONFIDENCE
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: colors.amareloNeon,
            }}
          >
            {(incident.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Evidence breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.8rem",
            color: "var(--color-branco)",
            opacity: 0.8,
            letterSpacing: "0.05em",
          }}
        >
          MULTI-SIGNAL EVIDENCE BREAKDOWN
        </div>

        {/* Reports deduplication metric */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 8px",
            background: "rgba(255, 255, 255, 0.03)",
            fontSize: "0.8rem",
            borderLeft: `3px solid ${colors.amareloNeon}`,
          }}
        >
          <span>Corroborating Reports</span>
          <span style={{ fontFamily: "var(--font-mono)", color: colors.amareloNeon, fontWeight: 700 }}>
            {incident.report_count} clustered reports
          </span>
        </div>

        {/* Vision check */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 8px",
            background: "rgba(255, 255, 255, 0.03)",
            fontSize: "0.8rem",
            borderLeft: `3px solid ${imgResult?.shows_flooding ? colors.verdeNeon : colors.laranja}`,
          }}
        >
          <span>Vision LLM Analysis</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-branco)" }}>
            {imgResult ? (
              imgResult.shows_flooding ? (
                <span style={{ color: colors.verdeNeon }}>FLOOD CONFIRMED ({imgResult.depth_estimate ?? "depth unknown"})</span>
              ) : (
                <span>No severe water</span>
              )
            ) : (
              <span style={{ opacity: 0.6 }}>Sensor / Heuristic fallback</span>
            )}
          </span>
        </div>

        {/* Rain reading */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 8px",
            background: "rgba(255, 255, 255, 0.03)",
            fontSize: "0.8rem",
            borderLeft: `3px solid ${colors.azulFosco}`,
          }}
        >
          <span>Localized Rainfall</span>
          <span style={{ fontFamily: "var(--font-mono)", color: colors.azulFosco, fontWeight: 700 }}>
            {incident.evidence?.rainfall_mm_h?.toFixed(1) ?? "45.0"} mm/h
          </span>
        </div>
      </div>

      {/* Recommended action */}
      {incident.recommended_action && (
        <div
          style={{
            background: "rgba(255, 102, 0, 0.08)",
            border: `2px dashed ${colors.laranja}`,
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              color: colors.laranja,
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            RECOMMENDED RESPONSE ACTION
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--color-branco)" }}>
            {incident.recommended_action}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        {onAllocateTeam && (
          <button
            onClick={() => onAllocateTeam(incident.id)}
            style={{
              flex: 1,
              background: colors.rosaNeon,
              color: "#000",
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              padding: "8px 12px",
              border: "2px solid #000",
              boxShadow: "2px 2px 0 #000",
              cursor: "pointer",
            }}
          >
            {incident.assigned_team_id ? "RE-DISPATCH TEAM" : "DISPATCH RESCUE TEAM"}
          </button>
        )}

        {onTriggerAlert && (
          <button
            onClick={() => onTriggerAlert(incident.id)}
            style={{
              flex: 1,
              background: colors.vermelho,
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              padding: "8px 12px",
              border: "2px solid #000",
              boxShadow: "2px 2px 0 #000",
              cursor: "pointer",
            }}
          >
            ISSUE BROADCAST ALERT
          </button>
        )}
      </div>
    </div>
  );
}
