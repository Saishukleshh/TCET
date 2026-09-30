"use client";

import { useEffect, useState } from "react";
import { colors } from "@/lib/design-tokens";
import { fetchZoneSitrep } from "@/lib/api-client";

interface RiskFactors {
  rain_norm: number;
  low_elevation: number;
  history: number;
  incident_density: number;
}

interface RiskExplainProps {
  zoneId?: string;
  zoneName: string;
  risk: number;
  factors: RiskFactors;
  rainfallMmH: number;
  populationExposed: number;
}

const WEIGHTS = { rain_norm: 0.40, low_elevation: 0.25, history: 0.20, incident_density: 0.15 };

const FACTOR_LABELS: Record<string, string> = {
  rain_norm: "Rainfall Intensity",
  low_elevation: "Low Elevation Deficit",
  history: "Historical Inundation",
  incident_density: "Citizen Signal Density",
};

function riskColor(risk: number): string {
  if (risk >= 0.70) return colors.vermilion;
  if (risk >= 0.45) return colors.ochre;
  if (risk >= 0.25) return colors.indigo;
  return colors.pine;
}

function riskLabel(risk: number): string {
  if (risk >= 0.70) return "CRITICAL";
  if (risk >= 0.45) return "WARNING";
  if (risk >= 0.25) return "WATCH";
  return "SAFE";
}

export default function RiskExplain({
  zoneId,
  zoneName,
  risk,
  factors,
  rainfallMmH,
  populationExposed,
}: RiskExplainProps) {
  const colour = riskColor(risk);
  const [sitrep, setSitrep] = useState<{
    summary: string;
    recommended_action: string;
    confidence: number;
    model: string;
  } | null>(null);
  const [loadingSitrep, setLoadingSitrep] = useState(false);

  useEffect(() => {
    if (!zoneId) return;
    let isCancelled = false;
    setLoadingSitrep(true);

    fetchZoneSitrep(zoneId)
      .then((data) => {
        if (!isCancelled) {
          setSitrep({
            summary: data.summary,
            recommended_action: data.recommended_action,
            confidence: data.confidence,
            model: data.model,
          });
        }
      })
      .catch((err) => {
        console.warn("Could not load AI SitRep:", err);
      })
      .finally(() => {
        if (!isCancelled) setLoadingSitrep(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [zoneId, rainfallMmH]);

  return (
    <div
      style={{
        background: colors.washiCard,
        border: `3px solid ${colors.ink}`,
        padding: "var(--space-3)",
        boxShadow: `4px 4px 0 ${colors.ink}`,
        color: colors.ink,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-1)" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, opacity: 0.7, letterSpacing: "0.08em" }}>
          EXPLAINABLE RISK MATRIX
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: colour, letterSpacing: "0.05em" }}>
          {riskLabel(risk)}
        </span>
      </div>

      <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, marginBottom: "var(--space-2)" }}>
        {zoneName}
      </div>

      {/* Risk bar */}
      <div style={{ background: colors.washiMuted, height: 8, marginBottom: "var(--space-3)", border: `1px solid ${colors.ink}`, overflow: "hidden" }}>
        <div style={{ width: `${((risk ?? 0) * 100).toFixed(0)}%`, height: "100%", background: colour, transition: "width 600ms ease-out" }} />
      </div>

      {/* Factor breakdown */}
      <div style={{ fontSize: "0.75rem" }}>
        <div style={{ fontFamily: "var(--font-display)", marginBottom: 8, fontWeight: 700, letterSpacing: "0.06em", borderBottom: `1px solid ${colors.ink}`, paddingBottom: 4 }}>
          FACTOR CONTRIBUTION ANALYSIS
        </div>
        {(Object.keys(WEIGHTS) as (keyof RiskFactors)[]).map((key) => {
          const val = factors?.[key] ?? 0;
          const weight = WEIGHTS[key] ?? 0.25;
          const contribution = val * weight;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 140, opacity: 0.85, fontFamily: "var(--font-body)" }}>{FACTOR_LABELS[key]}</span>
              <div style={{ flex: 1, background: colors.washiMuted, height: 6, border: `1px solid ${colors.ink}`, overflow: "hidden" }}>
                <div style={{ width: `${(contribution * 100).toFixed(0)}%`, height: "100%", background: colour }} />
              </div>
              <span style={{ width: 38, textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                {(contribution * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      <div style={{ marginTop: "var(--space-2)", borderTop: `1px solid ${colors.washiMuted}`, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
        <span>Precip: {(rainfallMmH ?? 0).toFixed(1)} mm/h</span>
        <span>Exposed: {(populationExposed ?? 0).toLocaleString()}</span>
      </div>


      {/* AI Tactical Situation Brief (SitRep) */}
      <div
        style={{
          marginTop: "var(--space-3)",
          padding: "var(--space-2)",
          background: colors.washi,
          border: `2px solid ${colors.ink}`,
          boxShadow: `2px 2px 0 ${colors.ink}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em" }}>
            AI SITREP BRIEFING
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              fontFamily: "var(--font-mono)",
              background: sitrep?.model?.includes("groq") ? colors.indigo : colors.washiMuted,
              color: sitrep?.model?.includes("groq") ? colors.washi : colors.ink,
              padding: "2px 6px",
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            {loadingSitrep ? "ANALYZING..." : sitrep?.model || "GROQ LLAMA-3.3"}
          </span>
        </div>

        {loadingSitrep ? (
          <div style={{ fontSize: "0.75rem", opacity: 0.7, fontStyle: "italic", padding: "6px 0" }}>
            Synthesizing telemetry & neural situational assessment...
          </div>
        ) : sitrep ? (
          <div style={{ fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ margin: 0, lineHeight: 1.4, opacity: 0.9 }}>
              {sitrep.summary}
            </p>
            <div
              style={{
                marginTop: 4,
                padding: "6px 8px",
                background: colors.washiCard,
                borderLeft: `3px solid ${colour}`,
                fontSize: "0.7rem",
              }}
            >
              <div style={{ fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 2 }}>
                RECOMMENDED ACTION:
              </div>
              <div style={{ opacity: 0.85 }}>{sitrep.recommended_action}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "0.65rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>
              AI Confidence: {(sitrep.confidence * 100).toFixed(0)}%
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
            Select a sector to generate tactical brief.
          </div>
        )}
      </div>
    </div>
  );
}

