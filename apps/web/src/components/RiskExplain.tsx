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
  rain_norm: "Rainfall intensity",
  low_elevation: "Low elevation",
  history: "Flood history",
  incident_density: "Incident density",
};

function riskColor(risk: number): string {
  if (risk >= 0.70) return colors.vermelho;
  if (risk >= 0.45) return colors.laranja;
  if (risk >= 0.25) return colors.amareloNeon;
  return colors.verdeNeon;
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
        background: "var(--surface-overlay)",
        border: `4px solid ${colour}`,
        padding: "var(--space-2)",
        boxShadow: `4px 4px 0 #000`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-1)" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "var(--color-branco)", opacity: 0.6, letterSpacing: "0.05em" }}>
          RISK ASSESSMENT
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700, color: colour, letterSpacing: "-0.02em" }}>
          {riskLabel(risk)}
        </span>
      </div>

      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", color: "var(--color-branco)", marginBottom: "var(--space-1)" }}>
        {zoneName}
      </div>

      {/* Risk bar */}
      <div style={{ background: "var(--surface-card)", height: 6, marginBottom: "var(--space-2)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${(risk * 100).toFixed(0)}%`, height: "100%", background: colour, transition: "width 600ms ease-out" }} />
      </div>

      {/* Factor breakdown */}
      <div style={{ fontSize: "0.72rem", color: "var(--color-branco)" }}>
        <div style={{ fontFamily: "var(--font-display)", marginBottom: 6, opacity: 0.7, letterSpacing: "0.05em" }}>WHY THIS SCORE</div>
        {(Object.keys(WEIGHTS) as (keyof RiskFactors)[]).map((key) => {
          const val = factors[key];
          const weight = WEIGHTS[key];
          const contribution = val * weight;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 120, opacity: 0.8 }}>{FACTOR_LABELS[key]}</span>
              <div style={{ flex: 1, background: "var(--surface-card)", height: 5, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${(val * 100).toFixed(0)}%`, height: "100%", background: colour, opacity: 0.75 }} />
              </div>
              <span style={{ width: 34, textAlign: "right", opacity: 0.7 }}>{(contribution * 100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      <div style={{ marginTop: "var(--space-1)", display: "flex", gap: 12, fontSize: "0.7rem", color: "var(--color-branco)", opacity: 0.6 }}>
        <span>🌧 {rainfallMmH.toFixed(1)} mm/h</span>
        <span>👥 {populationExposed.toLocaleString()} at risk</span>
      </div>
    </div>
  );
}
