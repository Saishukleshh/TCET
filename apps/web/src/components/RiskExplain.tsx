"use client";

import { colors } from "@/lib/design-tokens";

interface RiskFactors {
  rain_norm: number;
  low_elevation: number;
  history: number;
  incident_density: number;
}

interface RiskExplainProps {
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

export default function RiskExplain({ zoneName, risk, factors, rainfallMmH, populationExposed }: RiskExplainProps) {
  const colour = riskColor(risk);
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
        <div style={{ width: `${(risk * 100).toFixed(0)}%`, height: "100%", background: colour, transition: "width 600ms ease-out" }} />
      </div>

      {/* Factor breakdown */}
      <div style={{ fontSize: "0.75rem" }}>
        <div style={{ fontFamily: "var(--font-display)", marginBottom: 8, fontWeight: 700, letterSpacing: "0.06em", borderBottom: `1px solid ${colors.ink}`, paddingBottom: 4 }}>
          FACTOR CONTRIBUTION ANALYSIS
        </div>
        {(Object.keys(WEIGHTS) as (keyof RiskFactors)[]).map((key) => {
          const val = factors[key];
          const weight = WEIGHTS[key];
          const contribution = val * weight;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 140, opacity: 0.85, fontFamily: "var(--font-body)" }}>{FACTOR_LABELS[key]}</span>
              <div style={{ flex: 1, background: colors.washiMuted, height: 6, border: `1px solid ${colors.ink}`, overflow: "hidden" }}>
                <div style={{ width: `${(val * 100).toFixed(0)}%`, height: "100%", background: colour }} />
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
        <span>Precip: {rainfallMmH.toFixed(1)} mm/h</span>
        <span>Exposed: {populationExposed.toLocaleString()}</span>
      </div>
    </div>
  );
}
