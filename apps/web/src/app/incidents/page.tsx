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
        minHeight: "100dvh",
        background: "var(--surface-base)",
        color: "var(--color-branco)",
        padding: "var(--space-4)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-4)",
          borderBottom: "2px solid var(--surface-border)",
          paddingBottom: "var(--space-2)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <h1
              style={{
                fontFamily: "var(--font-accent)",
                fontSize: "var(--text-h1)",
                color: colors.amareloNeon,
                letterSpacing: "0.06em",
                margin: 0,
              }}
            >
              INCIDENT TRIAGE QUEUE
            </h1>
            <span style={{ fontFamily: "var(--font-mono)", color: colors.rosaNeon, fontSize: "0.85rem" }}>
              {filtered.length} INCIDENTS RECORDED
            </span>
          </div>
          <p style={{ margin: "4px 0 0", opacity: 0.6, fontSize: "0.85rem" }}>
            Real-time clustering and verification. Duplicated citizen reports consolidated into singular operational incidents.
          </p>
        </div>

        <Link
          href="/command"
          style={{
            fontFamily: "var(--font-display)",
            padding: "8px 16px",
            background: colors.amareloNeon,
            color: "#000",
            textDecoration: "none",
            border: "2px solid #000",
            boxShadow: "3px 3px 0 #000",
          }}
        >
          ← BACK TO COMMAND
        </Link>
      </div>

      {/* Filter Chips */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: "var(--space-3)",
          background: "var(--surface-overlay)",
          padding: "12px 16px",
          border: "1px solid var(--surface-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", opacity: 0.7, fontFamily: "var(--font-display)" }}>
            SEVERITY:
          </span>
          {["all", "critical", "warning", "watch"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSev(s)}
              style={{
                background: filterSev === s ? colors.amareloNeon : "var(--surface-card)",
                color: filterSev === s ? "#000" : "var(--color-branco)",
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                padding: "4px 10px",
                border: "1px solid var(--surface-border)",
                cursor: "pointer",
              }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", opacity: 0.7, fontFamily: "var(--font-display)" }}>
            STATUS:
          </span>
          {["all", "verified", "probable", "unverified"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStat(st)}
              style={{
                background: filterStat === st ? colors.verdeNeon : "var(--surface-card)",
                color: filterStat === st ? "#000" : "var(--color-branco)",
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                padding: "4px 10px",
                border: "1px solid var(--surface-border)",
                cursor: "pointer",
              }}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>Loading incident queue...</div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            background: "var(--surface-overlay)",
            border: "1px dashed var(--surface-border)",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", opacity: 0.5 }}>
            NO INCIDENTS MATCHING FILTER
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {filtered.map((inc) => {
            const sevCol = severityColor[inc.severity] ?? colors.vermelho;
            const statCol = confidenceColor[inc.status] ?? colors.branco;
            return (
              <div
                key={inc.id}
                style={{
                  background: "var(--surface-overlay)",
                  border: `3px solid ${sevCol}`,
                  boxShadow: "4px 4px 0 #000",
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
                        fontSize: "1.1rem",
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
                        color: "var(--color-branco)",
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
                        background: inc.status !== "unverified" ? `${statCol}22` : "transparent",
                        color: statCol,
                        border: inc.status === "unverified" ? `1px dashed ${colors.branco}` : `1px solid ${statCol}`,
                        padding: "2px 8px",
                      }}
                    >
                      {inc.status.toUpperCase()}
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        background: "var(--surface-card)",
                        padding: "2px 8px",
                        border: "1px solid var(--surface-border)",
                      }}
                    >
                      {inc.report_count} clustered reports
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        color: colors.amareloNeon,
                        padding: "2px 6px",
                      }}
                    >
                      {(inc.confidence * 100).toFixed(0)}% conf
                    </span>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "var(--color-branco)", opacity: 0.8, marginBottom: 12 }}>
                    {inc.recommended_action ?? "Monitor condition; assign observation team."}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--surface-border)",
                    paddingTop: 8,
                  }}
                >
                  <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                    {inc.lat.toFixed(4)}°N, {inc.lng.toFixed(4)}°E
                  </span>
                  <Link
                    href={`/incidents/${inc.id}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      color: colors.rosaNeon,
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
