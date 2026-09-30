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
  "rain.updated": colors.azulFosco,
  "risk.updated": colors.laranja,
  "report.submitted": colors.branco,
  "incident.created": colors.vermelho,
  "incident.updated": colors.amareloNeon,
  "road.blocked": colors.vermelho,
  "route.recalculated": colors.verdeNeon,
  "resource.assigned": colors.rosaNeon,
  "alert.pending": colors.vermelho,
  "alert.sent": colors.verdeNeon,
  "alert.rejected": colors.branco,
  "simulate.reset": colors.amareloNeon,
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
      return `Zone risk matrix recalculated`;
    case "report.submitted":
      return `Citizen report #${(p.report_id ?? "").slice(0, 6)} geotagged`;
    case "incident.created":
      return `Incident created: ${p.severity?.toUpperCase() ?? "WATCH"} (${p.report_count ?? 1} reports)`;
    case "incident.updated":
      return `Incident updated: ${p.severity?.toUpperCase() ?? "WATCH"} (${p.report_count ?? 1} reports)`;
    case "road.blocked":
      return `Road impassable: safety barrier deployed`;
    case "route.recalculated":
      return `Evacuation route updated (${p.duration_sec ? Math.round(p.duration_sec / 60) + "m" : "safe"})`;
    case "resource.assigned":
      return `${p.count ?? 1} response team(s) assigned`;
    case "alert.pending":
      return `Alert created: ${p.tier?.toUpperCase() ?? "ALERT"} awaiting approval`;
    case "alert.sent":
      return `Emergency alert transmitted to citizens`;
    case "simulate.reset":
      return `Demo state reset to base baseline`;
    default:
      return JSON.stringify(p).slice(0, 45);
  }
}

export default function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div
      style={{
        background: "var(--surface-overlay)",
        borderTop: "2px solid var(--surface-border)",
        height: 48,
        display: "flex",
        alignItems: "center",
        overflowX: "auto",
        padding: "0 var(--space-2)",
        gap: 12,
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingRight: 12,
          borderRight: "1px solid var(--surface-border)",
          whiteSpace: "nowrap",
          color: "var(--color-branco)",
          fontFamily: "var(--font-display)",
          letterSpacing: "0.08em",
          fontSize: "0.8rem",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: colors.verdeNeon,
            boxShadow: `0 0 6px ${colors.verdeNeon}`,
          }}
        />
        LIVE TIMELINE
      </div>

      {events.length === 0 ? (
        <span style={{ color: "var(--color-branco)", opacity: 0.4 }}>
          Awaiting real-time telemetry stream...
        </span>
      ) : (
        events.slice(0, 20).map((ev, i) => {
          const col = EVENT_COLOR[ev.kind] ?? colors.branco;
          return (
            <div
              key={ev.id || i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--surface-card)",
                padding: "3px 8px",
                borderLeft: `3px solid ${col}`,
                whiteSpace: "nowrap",
                borderTop: "1px solid var(--surface-border)",
                borderRight: "1px solid var(--surface-border)",
                borderBottom: "1px solid var(--surface-border)",
              }}
            >
              <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>{formatTime(ev.ts)}</span>
              <span style={{ color: col, fontWeight: 700 }}>{ev.kind}</span>
              <span style={{ color: "var(--color-branco)", opacity: 0.9 }}>
                {eventSummary(ev)}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
