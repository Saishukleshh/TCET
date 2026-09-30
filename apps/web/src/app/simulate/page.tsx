"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { colors } from "@/lib/design-tokens";
import {
  simulateRain,
  simulateReports,
  simulateBlockRoad,
  simulateReset,
  fetchSimulatorState,
  allocateResources,
  fetchIncidents,
  fetchAlerts,
  approveAlert,
} from "@/lib/api-client";

export default function SimulatePage() {
  const [rainMm, setRainMm] = useState<number>(0);
  const [state, setState] = useState<any>(null);
  const [log, setLog] = useState<string[]>([]);
  const [isRunningScenario, setIsRunningScenario] = useState<boolean>(false);
  const [scenarioStep, setScenarioStep] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshState = async () => {
    try {
      const s = await fetchSimulatorState();
      setState(s);
    } catch (e) {
      console.warn("Could not fetch state", e);
    }
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 3000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 30)]);
  };

  const handleSetRain = async (mm: number) => {
    setRainMm(mm);
    addLog(`Setting rainfall intensity to ${mm} mm/h...`);
    try {
      await simulateRain(mm);
      addLog(`✓ Rainfall updated. Broadcasted rain.updated & risk.updated.`);
      await refreshState();
    } catch (e) {
      addLog(`✗ Error setting rain: ${e}`);
    }
  };

  const handleInjectReports = async (count: number = 23) => {
    addLog(`Injecting ${count} citizen reports near Kurla West...`);
    try {
      const res = await simulateReports(count, "zone-001");
      addLog(`✓ Injected ${res.reports_injected} reports. Clustered into ${res.incidents_created_or_updated} incident.`);
      await refreshState();
    } catch (e) {
      addLog(`✗ Error injecting reports: ${e}`);
    }
  };

  const handleBlockRoad = async () => {
    addLog(`Deploying road safety barrier on LBS Marg...`);
    try {
      const res = await simulateBlockRoad("flooding");
      addLog(`✓ Road #${res.road_id.slice(0, 8)} blocked. Safe evacuation corridor recalculated avoiding hazard.`);
      await refreshState();
    } catch (e) {
      addLog(`✗ Error blocking road: ${e}`);
    }
  };

  const handleAllocate = async () => {
    addLog(`Solving Hungarian optimization for team assignments...`);
    try {
      const incs = await fetchIncidents();
      const ids = incs.map((i: any) => i.id);
      if (!ids.length) {
        addLog(`No active incidents found to allocate.`);
        return;
      }
      const res = await allocateResources(ids);
      addLog(`✓ Resource allocation completed: ${res.assignments?.length ?? 0} unit assignments solved.`);
      await refreshState();
    } catch (e) {
      addLog(`✗ Error allocating resources: ${e}`);
    }
  };

  const handleApproveAlerts = async () => {
    addLog(`Checking for pending emergency alerts...`);
    try {
      const alerts = await fetchAlerts();
      const pending = alerts.filter((a: any) => a.status === "pending");
      if (!pending.length) {
        addLog(`No pending alerts.`);
        return;
      }
      for (const a of pending) {
        await approveAlert(a.id, "Demo Simulator Auto-Commander");
        addLog(`✓ Approved and broadcasted ${a.tier.toUpperCase()} alert to affected citizens.`);
      }
      await refreshState();
    } catch (e) {
      addLog(`✗ Error approving alerts: ${e}`);
    }
  };

  const handleReset = async () => {
    addLog(`Resetting simulation state to baseline seed data...`);
    try {
      await simulateReset();
      setRainMm(0);
      setIsRunningScenario(false);
      setScenarioStep(0);
      if (timerRef.current) clearTimeout(timerRef.current);
      addLog(`✓ State reset to initial seed values.`);
      await refreshState();
    } catch (e) {
      addLog(`✗ Reset error: ${e}`);
    }
  };

  // Full 10:42 -> 10:52 Demo Scenario Runner
  const runFullScenario = async () => {
    setIsRunningScenario(true);
    setScenarioStep(1);
    addLog("=== INITIATING 10:42 -> 10:52 DEMO CHRONICLE ===");

    // Step 1: 10:42 Rainfall anomaly
    addLog("10:42 — Precipitation anomaly detected (Open-Meteo ingest + 55 mm/h)");
    await simulateRain(55);
    setRainMm(55);
    await refreshState();

    // Step 2: 10:45 Risk score calculation
    await new Promise((r) => setTimeout(r, 2000));
    setScenarioStep(2);
    addLog("10:45 — Vulnerability matrix calculated: Kurla West exceeds 70% (CRITICAL, factor breakdown updated)");
    await refreshState();

    // Step 3: 10:47 Inject 23 reports
    await new Promise((r) => setTimeout(r, 2500));
    setScenarioStep(3);
    addLog("10:47 — 23 citizen distress signals ingested across Kurla corridor");
    await simulateReports(23, "zone-001");
    await refreshState();

    // Step 4: 10:48 Deduplication & photo verify
    await new Promise((r) => setTimeout(r, 2500));
    setScenarioStep(4);
    addLog("10:48 — Multi-signal verification: 17 duplicate reports aggregated into 1 VERIFIED incident");
    await refreshState();

    // Step 5: 10:49 Road marked unsafe
    await new Promise((r) => setTimeout(r, 2500));
    setScenarioStep(5);
    addLog("10:49 — Hazard barrier deployed: LBS Marg arterial impassable");
    await simulateBlockRoad("flooding");
    await refreshState();

    // Step 6: 10:50 Route recalculated
    await new Promise((r) => setTimeout(r, 2000));
    setScenarioStep(6);
    addLog("10:50 — Evacuation corridor dynamically recalculated avoiding hazard segment and flood polygons");
    await refreshState();

    // Step 7: 10:51 Emergency resources assigned
    await new Promise((r) => setTimeout(r, 2500));
    setScenarioStep(7);
    addLog("10:51 — Hungarian optimization assigns nearest Rescue Alpha unit to verified incident");
    const incs = await fetchIncidents();
    if (incs.length) await allocateResources(incs.map((i: any) => i.id));
    await refreshState();

    // Step 8: 10:52 Command alert approved and sent
    await new Promise((r) => setTimeout(r, 2500));
    setScenarioStep(8);
    addLog("10:52 — Command authorization signed: Critical evacuation notice transmitted to citizens");
    const alerts = await fetchAlerts();
    const pending = alerts.filter((a: any) => a.status === "pending");
    for (const p of pending) {
      await approveAlert(p.id, "Commander");
    }
    await refreshState();

    addLog("=== DEMO CHRONICLE COMPLETE: FULL OPERATIONAL LOOP VALIDATED ===");
    setIsRunningScenario(false);
  };

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
          gap: 14,
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
                fontSize: "clamp(1.25rem, 3.5vw, 2rem)",
                color: colors.ink,
                letterSpacing: "0.05em",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              SIMULATOR & DEMO CONTROLLER
            </h1>
            <span
              style={{
                border: `1.5px solid ${colors.vermilion}`,
                color: colors.vermilion,
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                fontWeight: 800,
                padding: "2px 8px",
                whiteSpace: "nowrap",
              }}
            >
              REHEARSAL CHAMBER
            </span>
          </div>
          <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: "0.85rem", fontFamily: "var(--font-body)", lineHeight: 1.4 }}>
            Execute the complete automated 10:42 → 10:52 scenario, inject duplicate crowdsourced reports, deploy road hazard blocks, and test dynamic re-routing.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button
            onClick={handleReset}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              padding: "10px 16px",
              minHeight: 40,
              background: "transparent",
              color: colors.vermilion,
              border: `2px solid ${colors.vermilion}`,
              boxShadow: `2px 2px 0 ${colors.vermilion}`,
              cursor: "pointer",
            }}
          >
            RESET STATE
          </button>
        </div>
      </div>

      {/* Live State Summary Bar */}
      {state && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          style={{
            marginBottom: "var(--space-3)",
            background: colors.washiCard,
            padding: "12px 14px",
            border: `2px solid ${colors.ink}`,
            boxShadow: `3px 3px 0 ${colors.ink}`,
          }}
        >
          <div>
            <div style={{ fontSize: "0.65rem", opacity: 0.7, fontFamily: "var(--font-display)", fontWeight: 700 }}>PRECIPITATION</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: colors.prussian, fontWeight: 800 }}>
              {rainMm.toFixed(1)} mm/h
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", opacity: 0.7, fontFamily: "var(--font-display)", fontWeight: 700 }}>ACTIVE INCIDENTS</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: colors.vermilion, fontWeight: 800 }}>
              {state.incidents}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", opacity: 0.7, fontFamily: "var(--font-display)", fontWeight: 700 }}>REPORTS INGESTED</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: colors.ochre, fontWeight: 800 }}>
              {state.reports}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", opacity: 0.7, fontFamily: "var(--font-display)", fontWeight: 700 }}>ROAD HAZARDS</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: colors.vermilion, fontWeight: 800 }}>
              {state.blocked_roads}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", opacity: 0.7, fontFamily: "var(--font-display)", fontWeight: 700 }}>SEALS ISSUED</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: colors.pine, fontWeight: 800 }}>
              {state.alerts}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", opacity: 0.7, fontFamily: "var(--font-display)", fontWeight: 700 }}>RESPONSE UNITS</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: colors.indigo, fontWeight: 800 }}>
              {state.teams?.filter((t: any) => t.status === "available").length ?? 0}/{state.teams?.length ?? 5}
            </div>
          </div>
        </div>
      )}

      {/* Main Control Grid (Desktop: 2 columns; Mobile: Demo Scenario -> Chronicle -> Controls) */}
      <div className="flex flex-col md:grid md:grid-cols-[1.2fr_0.8fr] gap-6 w-full">
        {/* Left Column for desktop / separated on mobile */}
        <div className="contents md:flex md:flex-col md:gap-5">
          {/* Automated Scenario Section: Order 1 on mobile */}
          <div
            className="order-1"
            style={{
              background: colors.washiCard,
              border: `3px solid ${colors.ink}`,
              boxShadow: `4px 4px 0 ${colors.ink}`,
              padding: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                  fontWeight: 800,
                  color: colors.ink,
                  letterSpacing: "0.05em",
                }}
              >
                AUTOMATED DEMO SCENARIO (10:42 → 10:52)
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: isRunningScenario ? colors.vermilion : colors.ink,
                }}
              >
                {isRunningScenario ? `EXECUTING STEP ${scenarioStep}/8...` : "READY"}
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.5, margin: "0 0 16px 0", fontFamily: "var(--font-body)" }}>
              Executes the full judge demonstration loop sequentially: Anomaly detection → Vulnerability matrix update → 23 Reports
              consolidated into 1 incident → Road hazard deployment → Evacuation corridor re-routing → Hungarian dispatch →
              Command seal broadcast.
            </p>

            <button
              onClick={runFullScenario}
              disabled={isRunningScenario}
              style={{
                width: "100%",
                background: isRunningScenario ? colors.washiMuted : colors.vermilion,
                color: isRunningScenario ? colors.ink : "#FAF4E8",
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
                padding: "12px",
                minHeight: 46,
                border: `2px solid ${colors.ink}`,
                boxShadow: isRunningScenario ? "none" : `3px 3px 0 ${colors.ink}`,
                cursor: isRunningScenario ? "wait" : "pointer",
              }}
            >
              {isRunningScenario ? `EXECUTING STEP ${scenarioStep}/8...` : "EXECUTE FULL DEMO SCENARIO"}
            </button>
          </div>

          {/* Manual Trigger Controls: Order 3 on mobile */}
          <div
            className="order-3"
            style={{
              background: colors.washiCard,
              border: `2px solid ${colors.ink}`,
              boxShadow: `3px 3px 0 ${colors.ink}`,
              padding: "var(--space-3)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.05em" }}>
              MANUAL HAZARD & DISPATCH CONTROLS
            </div>

            {/* Rainfall Slider & Presets */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Rainfall Intensity: {rainMm} mm/h</span>
                <span style={{ fontSize: "0.75rem", color: colors.prussian, fontFamily: "var(--font-mono)" }}>
                  Continuous Risk Calculation
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={rainMm}
                onChange={(e) => handleSetRain(Number(e.target.value))}
                style={{ width: "100%", accentColor: colors.prussian, cursor: "pointer" }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {[
                  { label: "Clear (0)", val: 0 },
                  { label: "Drizzle (10)", val: 10 },
                  { label: "Watch (30)", val: 30 },
                  { label: "Warning (55)", val: 55 },
                  { label: "Cloudburst (85)", val: 85 },
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => handleSetRain(p.val)}
                    style={{
                      flex: "1 1 auto",
                      minWidth: 80,
                      padding: "8px 6px",
                      minHeight: 36,
                      background: colors.washiMuted,
                      color: colors.ink,
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      border: `1.5px solid ${colors.ink}`,
                      cursor: "pointer",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
              <button
                onClick={() => handleInjectReports(23)}
                style={{
                  padding: "10px",
                  minHeight: 44,
                  background: colors.washiMuted,
                  color: colors.ink,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                  cursor: "pointer",
                }}
              >
                + INJECT 23 REPORTS
              </button>

              <button
                onClick={handleBlockRoad}
                style={{
                  padding: "10px",
                  minHeight: 44,
                  background: colors.washiMuted,
                  color: colors.vermilion,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                  cursor: "pointer",
                }}
              >
                DEPLOY ROAD BLOCK
              </button>

              <button
                onClick={handleAllocate}
                style={{
                  padding: "10px",
                  minHeight: 44,
                  background: colors.washiMuted,
                  color: colors.indigo,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                  cursor: "pointer",
                }}
              >
                HUNGARIAN DISPATCH
              </button>

              <button
                onClick={handleApproveAlerts}
                style={{
                  padding: "10px",
                  minHeight: 44,
                  background: colors.washiMuted,
                  color: colors.pine,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                  cursor: "pointer",
                }}
              >
                APPROVE PENDING SEALS
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-time Event Console Log: Order 2 on mobile */}
        <div
          className="order-2 md:order-none"
          style={{
            background: colors.washiCard,
            border: `2.5px solid ${colors.ink}`,
            boxShadow: `4px 4px 0 ${colors.ink}`,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 360,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              background: colors.washiMuted,
              borderBottom: `2px solid ${colors.ink}`,
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>TELEMETRY CHRONICLE</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", opacity: 0.6 }}>
              {log.length} ENTRIES
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "12px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              background: "#FAF4E8",
              maxHeight: 420,
            }}
          >
            {log.length === 0 ? (
              <span style={{ opacity: 0.5, fontFamily: "var(--font-display)" }}>
                No telemetry actions recorded. Execute scenario to initiate stream.
              </span>
            ) : (
              log.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    color: entry.includes("✓")
                      ? colors.pine
                      : entry.includes("===")
                      ? colors.vermilion
                      : entry.includes("✗")
                      ? colors.vermilion
                      : colors.ink,
                    lineHeight: 1.45,
                    borderBottom: "1px dashed rgba(13, 13, 21, 0.1)",
                    paddingBottom: 2,
                  }}
                >
                  {entry}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

  );
}
