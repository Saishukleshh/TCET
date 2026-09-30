"use client";

import { colors, severityColor, confidenceColor } from "@/lib/design-tokens";

interface Incident {
  id: string;
  severity: "critical" | "warning" | "watch";
  status: string;
  confidence: number;
  report_count: number;
  created_at?: string;
  recommended_action?: string;
}

interface IncidentQueueProps {
  incidents: Incident[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const SEV_COLOR: Record<string, string> = {
  critical: colors.vermilion,
  warning:  colors.ochre,
  watch:    colors.indigo,
};

const STATUS_COLOR: Record<string, string> = {
  verified:   colors.pine,
  probable:   colors.ochre,
  unverified: colors.indigo,
};

function timeAgo(iso?: string): string {
  if (!iso) return "just now";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

export default function IncidentQueue({ incidents, selectedId, onSelect }: IncidentQueueProps) {
  if (!incidents.length) {
    return (
      <div style={{ padding: "var(--space-3)", color: colors.ink, opacity: 0.5, textAlign: "center", fontFamily: "var(--font-display)" }}>
        NO ACTIVE INCIDENTS
      </div>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {incidents.map((inc) => {
        const isSel = selectedId === inc.id;
        const sevCol = SEV_COLOR[inc.severity] ?? colors.vermilion;
        const statCol = STATUS_COLOR[inc.status] ?? colors.indigo;

        return (
          <li
            key={inc.id}
            onClick={() => onSelect?.(inc.id)}
            style={{
              borderLeft: `5px solid ${sevCol}`,
              borderTop: `2px solid ${colors.ink}`,
              borderRight: `2px solid ${colors.ink}`,
              borderBottom: `2px solid ${colors.ink}`,
              background: isSel ? colors.washiMuted : colors.washiCard,
              boxShadow: isSel ? `3px 3px 0 ${colors.ink}` : `2px 2px 0 ${colors.ink}`,
              cursor: "pointer",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "all 150ms ease",
              color: colors.ink,
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: sevCol,
                  letterSpacing: "0.06em",
                }}
              >
                {inc.severity.toUpperCase()}
              </span>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>
                {timeAgo(inc.created_at)}
              </span>
            </div>

            {/* Badges row */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: statCol,
                  border: `1.5px solid ${statCol}`,
                  background: colors.washiCard,
                  padding: "1px 6px",
                  letterSpacing: "0.04em",
                }}
              >
                {inc.status.toUpperCase()}
              </span>

              <span
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)",
                  background: colors.washiCard,
                  color: colors.ink,
                  padding: "1px 6px",
                  border: `1px solid ${colors.ink}`,
                }}
              >
                {inc.report_count} reports
              </span>

              <span
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)",
                  color: colors.indigo,
                  fontWeight: 700,
                }}
              >
                {(inc.confidence * 100).toFixed(0)}% conf
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
