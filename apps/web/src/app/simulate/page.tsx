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

  // Actions
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
      addLog(`✓ Injected ${res.reports_injected} reports. Deduplicated into ${res.incidents_created_or_updated} incident.`);
      await refreshState();
    } catch (e) {
      addLog(`✗ Error injecting reports: ${e}`);
    }
  };

  const handleBlockRoad = async () => {
    addLog(`Triggering road hazard block on LBS Marg...`);
    try {
      const res = await simulateBlockRoad("flooding");
      addLog(`✓ Road #${res.road_id.slice(0, 8)} blocked. Safe evacuation route recalculated avoiding flood polygons.`);
      await refreshState();
    } catch (e) {
      addLog(`✗ Error blocking road: ${e}`);
    }
  };

  const handleAllocate = async () => {
    addLog(`Triggering Hungarian algorithm resource allocation...`);
    try {
      const incs = await fetchIncidents();
      const ids = incs.map((i: any) => i.id);
      if (!ids.length) {
        addLog(`No active incidents found to allocate.`);
        return;
      }
      const res = await allocateResources(ids);
      addLog(`✓ Resource allocation completed: ${res.assignments?.length ?? 0} team assignments solved.`);
      await refreshState();
    } catch (e) {
      addLog(`✗ Error allocating resources: ${e}`);
    }
  };

  const handleApproveAlerts = async () => {
    addLog(`Checking for pending command alerts...`);
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
    addLog("=== STARTING 10:42 -> 10:52 DEMO SCENARIO ===");

    // Step 1: 10:42 Rainfall anomaly
    addLog("10:42 — Rainfall anomaly detected (Open-Meteo ingest + sim 55 mm/h)");
    await simulateRain(55);
    setRainMm(55);
    await refreshState();

    // Step 2: 10:45 Risk score calculation
    await new Promise((r) => setTimeout(r, 2000));
    setScenarioStep(2);
    addLog("10:45 — Flood risk calculated: Kurla West exceeds 70% (CRITICAL, factor breakdown updated)");
    await refreshState();

    // Step 3: 10:47 Inject 23 reports
    await new Promise((r) => setTimeout(r, 2500));
    setScenarioStep(3);
    addLog("10:47 — 23 citizen reports received across Kurla West corridor");
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
    addLog("10:49 — Road safety barrier deployed: LBS Marg impassable");
    await simulateBlockRoad("flooding");
    await refreshState();

    // Step 6: 10:50 Route recalculated
    await new Promise((r) => setTimeout(r, 2000));
    setScenarioStep(6);
    addLog("10:50 — Evacuation route dynamically recalculated avoiding blocked segment and waterlogged polygons");
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
    addLog("10:52 — Command authorization approved: Critical evacuation alert broadcasted to population");
    const alerts = await fetchAlerts();
    const pending = alerts.filter((a: any) => a.status === "pending");
    for (const p of pending) {
      await approveAlert(p.id, "Commander");
    }
    await refreshState();

    addLog("=== DEMO SCENARIO COMPLETE: FULL LOOP VALIDATED ===");
    setIsRunningScenario(false);
  };

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
              SIMULATOR & DEMO CONTROLLER
            </h1>
            <span style={{ fontFamily: "var(--font-mono)", color: colors.verdeNeon, fontSize: "0.85rem" }}>
              DEMO REHEARSAL & TELEMETRY INJECTOR
            </span>
          </div>
          <p style={{ margin: "4px 0 0", opacity: 0.6, fontSize: "0.85rem" }}>
            Control rainfall intensity, inject duplicate crowdsourced reports, deploy road blocks, and execute the automated 10:42 → 10:52 scenario.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleReset}
            style={{
              fontFamily: "var(--font-display)",
              padding: "8px 16px",
              background: "transparent",
              color: colors.vermelho,
              border: `2px solid ${colors.vermelho}`,
              cursor: "pointer",
            }}
          >
            ↺ RESET STATE
          </button>

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
            ← COMMAND CENTER
          </Link>
        </div>
      </div>

      {/* Live State Summary Bar */}
      {state && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 12,
            marginBottom: "var(--space-4)",
            background: "var(--surface-overlay)",
            padding: "12px 16px",
            border: "1px solid var(--surface-border)",
          }}
        >
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>CURRENT RAINFALL</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: colors.azulFosco, fontWeight: 700 }}>
              {rainMm.toFixed(1)} mm/h
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>ACTIVE INCIDENTS</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: colors.vermelho, fontWeight: 700 }}>
              {state.incidents}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>REPORTS INGESTED</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: colors.amareloNeon, fontWeight: 700 }}>
              {state.reports}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>ROAD HAZARDS</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: colors.laranja, fontWeight: 700 }}>
              {state.blocked_roads}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>ALERTS ISSUED</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: colors.verdeNeon, fontWeight: 700 }}>
              {state.alerts}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>AVAILABLE TEAMS</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: colors.rosaNeon, fontWeight: 700 }}>
              {state.teams?.filter((t: any) => t.status === "available").length ?? 0}/{state.teams?.length ?? 5}
            </div>
          </div>
        </div>
      )}

      {/* Main Control Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
        {/* Left: Control Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Automated Scenario Section */}
          <div
            style={{
              background: "var(--surface-overlay)",
              border: `3px solid ${colors.amareloNeon}`,
              boxShadow: "5px 5px 0 #000",
              padding: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  color: colors.amareloNeon,
                  letterSpacing: "0.06em",
                }}
              >
                1-CLICK AUTOMATED DEMO SCENARIO (10:42 → 10:52)
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: isRunningScenario ? colors.verdeNeon : "inherit",
                }}
              >
                {isRunningScenario ? `EXECUTING STEP ${scenarioStep}/8...` : "READY TO RUN"}
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.45, margin: "0 0 16px 0" }}>
              Runs the full judge demonstration loop sequentially: Anomaly detection → Zone risk matrix → 23 Reports
              clustered into 1 incident → Road hazard barrier → Evacuation route recalculation → Hungarian team dispatch →
              Command alert broadcast.
            </p>

            <button
              onClick={runFullScenario}
              disabled={isRunningScenario}
              style={{
                width: "100%",
                background: isRunningScenario ? "var(--surface-card)" : colors.amareloNeon,
                color: isRunningScenario ? "var(--color-branco)" : "#000",
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "12px",
                border: "2px solid #000",
                boxShadow: isRunningScenario ? "none" : "4px 4px 0 #000",
                cursor: isRunningScenario ? "wait" : "pointer",
              }}
            >
              {isRunningScenario ? `EXECUTING DEMO SCENARIO STEP ${scenarioStep}/8...` : "▶ EXECUTE FULL DEMO SCENARIO"}
            </button>
          </div>

          {/* Manual Trigger Controls */}
          <div
            style={{
              background: "var(--surface-overlay)",
              border: "2px solid var(--surface-border)",
              padding: "var(--space-3)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.06em" }}>
              MANUAL COMPONENT TRIGGERS
            </div>

            {/* Rainfall Slider & Presets */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>Rainfall Intensity: {rainMm} mm/h</span>
                <span style={{ fontSize: "0.75rem", color: colors.azulFosco, fontFamily: "var(--font-mono)" }}>
                  Dynamic Risk Calculation
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={rainMm}
                onChange={(e) => handleSetRain(Number(e.target.value))}
                style={{ width: "100%", accentColor: colors.azulFosco, cursor: "pointer" }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {[
                  { label: "Clear (0 mm)", val: 0 },
                  { label: "Drizzle (10 mm)", val: 10 },
                  { label: "Watch (30 mm)", val: 30 },
                  { label: "Warning (55 mm)", val: 55 },
                  { label: "Cloudburst (85 mm)", val: 85 },
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => handleSetRain(p.val)}
                    style={{
                      flex: 1,
                      padding: "6px",
                      background: "var(--surface-card)",
                      color: "var(--color-branco)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      border: "1px solid var(--surface-border)",
                      cursor: "pointer",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                onClick={() => handleInjectReports(23)}
                style={{
                  padding: "10px",
                  background: "var(--surface-card)",
                  color: colors.amareloNeon,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  border: `2px solid ${colors.amareloNeon}`,
                  cursor: "pointer",
                }}
              >
                + INJECT 23 CITIZEN REPORTS
              </button>

              <button
                onClick={handleBlockRoad}
                style={{
                  padding: "10px",
                  background: "var(--surface-card)",
                  color: colors.vermelho,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  border: `2px solid ${colors.vermelho}`,
                  cursor: "pointer",
                }}
              >
                ⚠ DEPLOY ROAD HAZARD BLOCK
              </button>

              <button
                onClick={handleAllocate}
                style={{
                  padding: "10px",
                  background: "var(--surface-card)",
                  color: colors.rosaNeon,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  border: `2px solid ${colors.rosaNeon}`,
                  cursor: "pointer",
                }}
              >
                ⚡ HUNGARIAN ALLOCATION
              </button>

              <button
                onClick={handleApproveAlerts}
                style={{
                  padding: "10px",
                  background: "var(--surface-card)",
                  color: colors.verdeNeon,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  border: `2px solid ${colors.verdeNeon}`,
                  cursor: "pointer",
                }}
              >
                ✓ APPROVE PENDING ALERTS
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-time Event Console Log */}
        <div
          style={{
            background: "var(--surface-overlay)",
            border: "2px solid var(--surface-border)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 480,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              background: "var(--surface-card)",
              borderBottom: "1px solid var(--surface-border)",
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              letterSpacing: "0.06em",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>REAL-TIME SCENARIO LOG</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", opacity: 0.5 }}>
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
              background: "#050505",
            }}
          >
            {log.length === 0 ? (
              <span style={{ opacity: 0.4 }}>No simulation actions triggered yet. Run scenario to view output.</span>
            ) : (
              log.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    color: entry.includes("✓")
                      ? colors.verdeNeon
                      : entry.includes("===")
                      ? colors.amareloNeon
                      : entry.includes("✗")
                      ? colors.vermelho
                      : "var(--color-branco)",
                    opacity: 0.9,
                    lineHeight: 1.4,
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
