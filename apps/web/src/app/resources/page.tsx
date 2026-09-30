"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { colors } from "@/lib/design-tokens";
import { fetchShelters, fetchTeams, fetchIncidents, allocateResources } from "@/lib/api-client";

interface Shelter {
  id: string;
  name: string;
  lng: number;
  lat: number;
  capacity: number;
  occupancy: number;
  status: "open" | "full" | "closed";
}

interface Team {
  id: string;
  name: string;
  type: string;
  lng: number;
  lat: number;
  status: "available" | "assigned" | "en_route" | "deployed";
  incident_id?: string | null;
}

const TEAM_STATUS_COLOR: Record<string, string> = {
  available: colors.verdeNeon,
  assigned: colors.amareloNeon,
  en_route: colors.laranja,
  deployed: colors.rosaNeon,
};

export default function ResourcesPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocationMsg, setAllocationMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [sData, tData] = await Promise.all([fetchShelters(), fetchTeams()]);
      if (Array.isArray(sData)) setShelters(sData);
      if (Array.isArray(tData)) setTeams(tData);
    } catch (err) {
      console.error("Error loading resources", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAllocation = async () => {
    try {
      setAllocationMsg("Solving cost matrix with Hungarian algorithm (linear_sum_assignment)...");
      const incs = await fetchIncidents();
      const incIds = incs.map((i: any) => i.id);
      if (!incIds.length) {
        setAllocationMsg("No incidents require assignment.");
        return;
      }
      const res = await allocateResources(incIds);
      if (res.assignments?.length) {
        setAllocationMsg(`✓ Assigned ${res.assignments.length} rescue teams optimizing travel time & incident severity.`);
      } else {
        setAllocationMsg(res.message ?? "No teams could be assigned.");
      }
      await loadData();
    } catch (err) {
      setAllocationMsg("Allocation optimization error.");
    }
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
      {/* Top Header */}
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
          <h1
            style={{
              fontFamily: "var(--font-accent)",
              fontSize: "var(--text-h1)",
              color: colors.rosaNeon,
              letterSpacing: "0.06em",
              margin: 0,
            }}
          >
            EMERGENCY RESOURCES & ASSET ALLOCATION
          </h1>
          <p style={{ margin: "4px 0 0", opacity: 0.6, fontSize: "0.85rem" }}>
            Real-time shelter capacity tracking and algorithmic dispatch of response teams (Hungarian algorithm).
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleRunAllocation}
            style={{
              fontFamily: "var(--font-display)",
              padding: "8px 16px",
              background: colors.rosaNeon,
              color: "#000",
              fontWeight: 800,
              letterSpacing: "0.05em",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000",
              cursor: "pointer",
            }}
          >
            OPTIMIZE ALLOCATION (HUNGARIAN)
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
            ← COMMAND MAP
          </Link>
        </div>
      </div>

      {allocationMsg && (
        <div
          style={{
            background: "rgba(255, 16, 240, 0.15)",
            border: `2px solid ${colors.rosaNeon}`,
            color: colors.rosaNeon,
            padding: "10px 16px",
            marginBottom: 20,
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
          }}
        >
          {allocationMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>Loading resources...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Evacuation Shelters Section */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                color: colors.azulFosco,
                letterSpacing: "0.06em",
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>EVACUATION SHELTERS ({shelters.length})</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-branco)", opacity: 0.6 }}>
                Total capacity: {shelters.reduce((acc, s) => acc + s.capacity, 0).toLocaleString()}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {shelters.map((s) => {
                const pct = s.capacity > 0 ? (s.occupancy / s.capacity) * 100 : 0;
                return (
                  <div
                    key={s.id}
                    style={{
                      background: "var(--surface-overlay)",
                      border: "2px solid var(--surface-border)",
                      padding: "var(--space-3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--color-branco)" }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                          ID: #{s.id} · {s.lat.toFixed(4)}°N, {s.lng.toFixed(4)}°E
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.7rem",
                          background: s.status === "open" ? `${colors.verdeNeon}22` : "red",
                          color: s.status === "open" ? colors.verdeNeon : "#fff",
                          border: `1px solid ${s.status === "open" ? colors.verdeNeon : "red"}`,
                          padding: "2px 8px",
                          fontWeight: 700,
                        }}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Capacity bar */}
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 4 }}>
                        <span style={{ opacity: 0.7 }}>Occupancy</span>
                        <span style={{ fontFamily: "var(--font-mono)", color: colors.azulFosco, fontWeight: 700 }}>
                          {s.occupancy} / {s.capacity} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div style={{ height: 8, background: "var(--surface-card)", overflow: "hidden", borderRadius: 2 }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: pct > 80 ? colors.vermelho : colors.azulFosco,
                            transition: "width 400ms ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emergency Response Teams Section */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                color: colors.rosaNeon,
                letterSpacing: "0.06em",
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>FIELD RESPONSE TEAMS ({teams.length})</span>
              <span style={{ fontSize: "0.75rem", color: colors.verdeNeon }}>
                {teams.filter((t) => t.status === "available").length} Ready for dispatch
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {teams.map((tm) => {
                const statCol = TEAM_STATUS_COLOR[tm.status] ?? colors.branco;
                return (
                  <div
                    key={tm.id}
                    style={{
                      background: "var(--surface-overlay)",
                      border: `2px solid ${tm.status === "assigned" ? colors.amareloNeon : "var(--surface-border)"}`,
                      padding: "var(--space-3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--color-branco)" }}>
                          {tm.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                          Type: {tm.type.toUpperCase()} · Location: {tm.lat.toFixed(4)}°N, {tm.lng.toFixed(4)}°E
                        </div>
                      </div>

                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          background: `${statCol}22`,
                          color: statCol,
                          border: `1px solid ${statCol}`,
                          padding: "2px 8px",
                          fontWeight: 700,
                        }}
                      >
                        {tm.status.toUpperCase()}
                      </span>
                    </div>

                    {tm.incident_id && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "6px 10px",
                          background: "var(--surface-card)",
                          borderLeft: `3px solid ${colors.amareloNeon}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.8rem",
                        }}
                      >
                        <span>Assigned to Incident #{tm.incident_id.slice(0, 8)}</span>
                        <Link
                          href={`/incidents/${tm.incident_id}`}
                          style={{
                            color: colors.amareloNeon,
                            fontFamily: "var(--font-display)",
                            fontSize: "0.75rem",
                            textDecoration: "none",
                          }}
                        >
                          VIEW INCIDENT →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
