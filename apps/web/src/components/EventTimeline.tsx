"use client";

import { colors } from "@/lib/design-tokens";

export interface TimelineEvent {
  id?: string;
  ts: string;
  kind: string;
  payload?: any;
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

const EVENT_COLOR: Record<string, string> = {
  "rain.updated":        colors.prussian,
  "risk.updated":        colors.ochre,
  "report.submitted":    colors.indigo,
  "incident.created":    colors.vermilion,
  "incident.updated":    colors.ochre,
  "road.blocked":        colors.vermilion,
  "route.recalculated":  colors.pine,
  "resource.assigned":   colors.indigo,
  "alert.pending":       colors.vermilion,
  "alert.sent":          colors.pine,
  "alert.rejected":      colors.ink,
  "simulate.reset":      colors.ochre,
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
}

function eventSummary(ev: TimelineEvent): string {
  const p = ev.payload ?? {};
  switch (ev.kind) {
    case "rain.updated":
      return `Rainfall ${p.intensity_mm_h?.toFixed(1) ?? "0"} mm/h (${p.source ?? "sim"})`;
    case "risk.updated":
      return `Vulnerability matrix re-calculated`;
    case "report.submitted":
      return `Citizen report #${(p.report_id ?? "").slice(0, 6)} logged`;
    case "incident.created":
      return `Incident created: ${p.severity?.toUpperCase() ?? "WATCH"} (${p.report_count ?? 1} signals)`;
    case "incident.updated":
      return `Incident updated: ${p.severity?.toUpperCase() ?? "WATCH"} (${p.report_count ?? 1} signals)`;
    case "road.blocked":
      return `Hazard barrier deployed: road impassable`;
    case "route.recalculated":
      return `Evacuation corridor updated (${p.duration_sec ? Math.round(p.duration_sec / 60) + "m" : "safe"})`;
    case "resource.assigned":
      return `${p.count ?? 1} response unit(s) dispatched`;
    case "alert.pending":
      return `Seal required: ${p.tier?.toUpperCase() ?? "ALERT"} pending signature`;
    case "alert.sent":
      return `Evacuation notice transmitted to citizens`;
    case "simulate.reset":
      return `System reset to baseline state`;
    default:
      return JSON.stringify(p).slice(0, 45);
  }
}

export default function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div
      style={{
        background: colors.washiCard,
        borderTop: `2px solid ${colors.ink}`,
        height: 48,
        display: "flex",
        alignItems: "center",
        overflowX: "auto",
        padding: "0 var(--space-2)",
        gap: 10,
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        color: colors.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingRight: 12,
          borderRight: `2px solid ${colors.ink}`,
          whiteSpace: "nowrap",
          color: colors.ink,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          letterSpacing: "0.08em",
          fontSize: "0.8rem",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            background: colors.vermilion,
            border: `1px solid ${colors.ink}`,
          }}
        />
        CHRONICLE SCROLL
      </div>

      {events.length === 0 ? (
        <span style={{ color: colors.ink, opacity: 0.5, fontFamily: "var(--font-display)" }}>
          Awaiting real-time telemetry stream...
        </span>
      ) : (
        events.slice(0, 20).map((ev, i) => {
          const col = EVENT_COLOR[ev.kind] ?? colors.ink;
          return (
            <div
              key={ev.id || i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: colors.washiMuted,
                padding: "3px 8px",
                borderLeft: `4px solid ${col}`,
                borderTop: `1px solid ${colors.ink}`,
                borderRight: `1px solid ${colors.ink}`,
                borderBottom: `1px solid ${colors.ink}`,
                whiteSpace: "nowrap",
                boxShadow: `1px 1px 0 ${colors.ink}`,
              }}
            >
              <span style={{ opacity: 0.6, fontSize: "0.7rem" }}>{formatTime(ev.ts)}</span>
              <span style={{ color: col, fontWeight: 700, fontFamily: "var(--font-display)" }}>{ev.kind}</span>
              <span style={{ opacity: 0.9 }}>
                {eventSummary(ev)}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
