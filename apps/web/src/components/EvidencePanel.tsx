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
  const sevCol = severityColor[incident.severity] ?? colors.vermilion;
  const confCol = confidenceColor[incident.status] ?? colors.pine;
  const imgResult = incident.evidence?.image_result;

  return (
    <div
      style={{
        background: colors.washiCard,
        border: `3px solid ${colors.ink}`,
        boxShadow: `4px 4px 0 ${colors.ink}`,
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        color: colors.ink,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `2px solid ${colors.ink}`,
          paddingBottom: "var(--space-1)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: colors.ink,
                letterSpacing: "0.06em",
              }}
            >
              INCIDENT #{incident.id.slice(0, 8)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                border: `2px solid ${sevCol}`,
                color: sevCol,
                fontWeight: 800,
                padding: "1px 6px",
              }}
            >
              {incident.severity.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: colors.ink, opacity: 0.6, fontFamily: "var(--font-mono)" }}>
            Coordinates: {typeof incident.lat === "number" ? incident.lat.toFixed(4) : "19.0680"}°N, {typeof incident.lng === "number" ? incident.lng.toFixed(4) : "72.8750"}°E /
          </div>

        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: `1px solid ${colors.ink}`,
              color: colors.ink,
              cursor: "pointer",
              fontSize: "0.9rem",
              padding: "2px 6px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Verification Status & Confidence */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: colors.washiMuted,
          padding: "8px 12px",
          border: `1.5px solid ${colors.ink}`,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.65rem", color: colors.ink, opacity: 0.7, fontFamily: "var(--font-display)" }}>
            VERIFICATION STATUS
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: confCol,
              letterSpacing: "0.05em",
            }}
          >
            {incident.status.toUpperCase()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.65rem", color: colors.ink, opacity: 0.7, fontFamily: "var(--font-display)" }}>
            CONFIDENCE RATING
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: colors.indigo,
            }}
          >
            {(typeof incident.confidence === "number" ? incident.confidence * 100 : 85).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Evidence Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.8rem",
            color: colors.ink,
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          MULTI-SIGNAL CORROBORATION
        </div>

        {/* Reports metric */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 8px",
            background: colors.washiMuted,
            fontSize: "0.8rem",
            borderLeft: `4px solid ${colors.ochre}`,
            borderTop: `1px solid ${colors.ink}`,
            borderRight: `1px solid ${colors.ink}`,
            borderBottom: `1px solid ${colors.ink}`,
          }}
        >
          <span>Corroborating Reports</span>
          <span style={{ fontFamily: "var(--font-mono)", color: colors.ochre, fontWeight: 700 }}>
            {incident.report_count} clustered signals
          </span>
        </div>

        {/* Vision check */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 8px",
            background: colors.washiMuted,
            fontSize: "0.8rem",
            borderLeft: `4px solid ${imgResult?.shows_flooding ? colors.pine : colors.ochre}`,
            borderTop: `1px solid ${colors.ink}`,
            borderRight: `1px solid ${colors.ink}`,
            borderBottom: `1px solid ${colors.ink}`,
          }}
        >
          <span>Visual Assessment</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700 }}>
            {imgResult ? (
              imgResult.shows_flooding ? (
                <span style={{ color: colors.pine }}>CONFIRMED FLOOD ({imgResult.depth_estimate ?? "depth unverified"})</span>
              ) : (
                <span>No inundation</span>
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
            background: colors.washiMuted,
            fontSize: "0.8rem",
            borderLeft: `4px solid ${colors.prussian}`,
            borderTop: `1px solid ${colors.ink}`,
            borderRight: `1px solid ${colors.ink}`,
            borderBottom: `1px solid ${colors.ink}`,
          }}
        >
          <span>Station Rainfall</span>
          <span style={{ fontFamily: "var(--font-mono)", color: colors.prussian, fontWeight: 700 }}>
            {incident.evidence?.rainfall_mm_h?.toFixed(1) ?? "45.0"} mm/h
          </span>
        </div>
      </div>

      {/* Recommended action */}
      {incident.recommended_action && (
        <div
          style={{
            background: colors.washiMuted,
            border: `2px dashed ${colors.ochre}`,
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: colors.ochre,
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            RECOMMENDED PROTOCOL
          </div>
          <div style={{ fontSize: "0.85rem", color: colors.ink }}>
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
              background: colors.indigo,
              color: "#FAF4E8",
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "8px 12px",
              border: `2px solid ${colors.ink}`,
              boxShadow: `3px 3px 0 ${colors.ink}`,
              cursor: "pointer",
            }}
          >
            {incident.assigned_team_id ? "RE-DISPATCH UNIT" : "DISPATCH RESCUE UNIT"}
          </button>
        )}

        {onTriggerAlert && (
          <button
            onClick={() => onTriggerAlert(incident.id)}
            style={{
              flex: 1,
              background: colors.vermilion,
              color: "#FAF4E8",
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "8px 12px",
              border: `2px solid ${colors.ink}`,
              boxShadow: `3px 3px 0 ${colors.ink}`,
              cursor: "pointer",
            }}
          >
            ISSUE BROADCAST
          </button>
        )}
      </div>
    </div>
  );
}
