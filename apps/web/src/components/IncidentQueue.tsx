"use client";

import { colors } from "@/lib/design-tokens";

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
  critical: colors.vermelho,
  warning:  colors.laranja,
  watch:    colors.amareloNeon,
};

const STATUS_COLOR: Record<string, string> = {
  verified:   colors.verdeNeon,
  probable:   colors.amareloNeon,
  unverified: colors.branco,
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
      <div style={{ padding: "var(--space-3)", color: "var(--color-branco)", opacity: 0.4, textAlign: "center", fontFamily: "var(--font-display)" }}>
        NO INCIDENTS
      </div>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {incidents.map((inc) => (
        <li
          key={inc.id}
          onClick={() => onSelect?.(inc.id)}
          style={{
            borderLeft: `5px solid ${SEV_COLOR[inc.severity] ?? "#fff"}`,
            background: selectedId === inc.id ? "var(--surface-card)" : "var(--surface-overlay)",
            cursor: "pointer",
            padding: "var(--space-2)",
            marginBottom: 2,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            transition: "background 200ms",
          }}
        >
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: SEV_COLOR[inc.severity],
                letterSpacing: "0.1em",
              }}
            >
              {inc.severity.toUpperCase()}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--color-branco)", opacity: 0.5 }}>
              {timeAgo(inc.created_at)}
            </span>
          </div>

          {/* Badges row */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {/* Confidence / status badge */}
            <span
              style={{
                fontSize: "0.65rem",
                fontFamily: "var(--font-display)",
                color: STATUS_COLOR[inc.status] ?? "#fff",
                border: inc.status === "unverified" ? `1px dashed ${colors.branco}` : "none",
                background: inc.status !== "unverified" ? STATUS_COLOR[inc.status] + "22" : "transparent",
                padding: "1px 6px",
                letterSpacing: "0.05em",
              }}
            >
              {inc.status.toUpperCase()}
            </span>

            {/* Report count */}
            <span
              style={{
                fontSize: "0.65rem",
                background: "var(--surface-card)",
                color: "var(--color-branco)",
                padding: "1px 6px",
                border: "1px solid var(--surface-border)",
              }}
            >
              {inc.report_count} reports
            </span>

            {/* Confidence */}
            <span
              style={{
                fontSize: "0.65rem",
                color: "var(--color-branco)",
                opacity: 0.7,
              }}
            >
              {(inc.confidence * 100).toFixed(0)}% conf
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
