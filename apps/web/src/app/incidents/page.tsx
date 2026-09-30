"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { colors, severityColor, confidenceColor } from "@/lib/design-tokens";
import { fetchIncidents } from "@/lib/api-client";

interface IncidentItem {
  id: string;
  severity: "critical" | "warning" | "watch";
  status: "verified" | "probable" | "unverified";
  confidence: number;
  report_count: number;
  lat: number;
  lng: number;
  created_at: string;
  recommended_action?: string;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [filterSev, setFilterSev] = useState<string>("all");
  const [filterStat, setFilterStat] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents()
      .then((data) => {
        if (Array.isArray(data)) setIncidents(data);
      })
      .catch((err) => console.error("Error fetching incidents", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = incidents.filter((inc) => {
    if (filterSev !== "all" && inc.severity !== filterSev) return false;
    if (filterStat !== "all" && inc.status !== filterStat) return false;
    return true;
  });

  return (
    <div
      style={{
        minHeight: "100%",
        background: colors.washi,
        color: colors.ink,
        padding: "clamp(12px, 3vw, 24px)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: "var(--space-3)",
          borderBottom: `2px solid ${colors.ink}`,
          paddingBottom: "var(--space-2)",
        }}
      >
        <div style={{ flex: 1, minWidth: "min(100%, 280px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.3rem, 3.5vw, 2.1rem)",
                color: colors.ink,
                letterSpacing: "0.05em",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              INCIDENT TRIAGE QUEUE
            </h1>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                border: `1.5px solid ${colors.vermilion}`,
                color: colors.vermilion,
                padding: "2px 8px",
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {filtered.length} SECTORS RECORDED
            </span>
          </div>
          <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: "0.85rem", fontFamily: "var(--font-body)", lineHeight: 1.4 }}>
            Real-time clustering and verification. Duplicated citizen distress reports consolidated into singular operational incidents.
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: "var(--space-3)",
          background: colors.washiCard,
          padding: "12px 14px",
          border: `2px solid ${colors.ink}`,
          boxShadow: `3px 3px 0 ${colors.ink}`,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-display)", minWidth: 90 }}>
            SEVERITY:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["all", "critical", "warning", "watch"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSev(s)}
                style={{
                  background: filterSev === s ? colors.vermilion : colors.washiMuted,
                  color: filterSev === s ? "#FAF4E8" : colors.ink,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "6px 12px",
                  minHeight: 38,
                  border: `1.5px solid ${colors.ink}`,
                  boxShadow: filterSev === s ? `2px 2px 0 ${colors.ink}` : "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-display)", minWidth: 90 }}>
            VERIFICATION:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["all", "verified", "probable", "unverified"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStat(st)}
                style={{
                  background: filterStat === st ? colors.pine : colors.washiMuted,
                  color: filterStat === st ? "#FAF4E8" : colors.ink,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "6px 12px",
                  minHeight: 38,
                  border: `1.5px solid ${colors.ink}`,
                  boxShadow: filterStat === st ? `2px 2px 0 ${colors.ink}` : "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Incident Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.6, fontFamily: "var(--font-display)" }}>
          Loading incident queue...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            background: colors.washiCard,
            border: `2px dashed ${colors.ink}`,
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", opacity: 0.6 }}>
            NO INCIDENTS MATCHING CRITERIA
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 16 }}>
          {filtered.map((inc) => {
            const sevCol = severityColor[inc.severity] ?? colors.vermilion;
            const statCol = confidenceColor[inc.status] ?? colors.pine;
            return (
              <div
                key={inc.id}
                style={{
                  background: colors.washiCard,
                  border: `3px solid ${colors.ink}`,
                  borderLeft: `6px solid ${sevCol}`,
                  boxShadow: `4px 4px 0 ${colors.ink}`,
                  padding: "var(--space-3)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.05rem",
                        fontWeight: 800,
                        color: sevCol,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {inc.severity.toUpperCase()} ALERT
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        color: colors.ink,
                        opacity: 0.6,
                      }}
                    >
                      #{inc.id.slice(0, 8)}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: colors.washiMuted,
                        color: statCol,
                        border: `1.5px solid ${statCol}`,
                        padding: "2px 8px",
                      }}
                    >
                      {inc.status.toUpperCase()}
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        background: colors.washiMuted,
                        padding: "2px 8px",
                        border: `1px solid ${colors.ink}`,
                      }}
                    >
                      {inc.report_count} clustered signals
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        color: colors.indigo,
                        fontWeight: 800,
                        padding: "2px 6px",
                      }}
                    >
                      {(inc.confidence * 100).toFixed(0)}% conf
                    </span>
                  </div>

                  <div style={{ fontSize: "0.85rem", opacity: 0.85, lineHeight: 1.45, marginBottom: 12 }}>
                    {inc.recommended_action ?? "Monitor conditions closely; dispatch field assessment team."}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: `1px solid ${colors.washiMuted}`,
                    paddingTop: 8,
                  }}
                >
                  <span style={{ fontSize: "0.75rem", opacity: 0.6, fontFamily: "var(--font-mono)" }}>
                    {inc.lat.toFixed(4)}°N, {inc.lng.toFixed(4)}°E
                  </span>
                  <Link
                    href={`/incidents/${inc.id}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: colors.indigo,
                      textDecoration: "none",
                      letterSpacing: "0.05em",
                    }}
                  >
                    INSPECT EVIDENCE →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
