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
  available: colors.pine,
  assigned: colors.ochre,
  en_route: colors.vermilion,
  deployed: colors.indigo,
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
      setAllocationMsg("Solving bipartite cost matrix with Hungarian algorithm (linear_sum_assignment)...");
      const incs = await fetchIncidents();
      const incIds = incs.map((i: any) => i.id);
      if (!incIds.length) {
        setAllocationMsg("No active incidents require assignment.");
        return;
      }
      const res = await allocateResources(incIds);
      if (res.assignments?.length) {
        setAllocationMsg(`[ASSIGNED] ${res.assignments.length} rescue teams dispatched via optimal travel-time matrix.`);
      } else {
        setAllocationMsg(res.message ?? "No available teams could be assigned.");
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
        background: colors.washi,
        color: colors.ink,
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
          borderBottom: `2px solid ${colors.ink}`,
          paddingBottom: "var(--space-2)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                border: `2px solid ${colors.vermilion}`,
                color: colors.vermilion,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
              }}
            >
              ASSET REGISTRY
            </span>
            <h1
              style={{
                fontFamily: "var(--font-hero)",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: colors.surface,
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              EMERGENCY RESOURCES & FIELD ALLOCATION
            </h1>
          </div>
          <p style={{ margin: "4px 0 0", opacity: 0.75, fontSize: "0.85rem", fontFamily: "var(--font-body)" }}>
            Real-time shelter capacity tracking and bipartite algorithmic dispatch of rescue teams via Hungarian optimization.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleRunAllocation}
            style={{
              fontFamily: "var(--font-display)",
              padding: "8px 18px",
              background: colors.vermilion,
              color: colors.washi,
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.06em",
              border: `2px solid ${colors.ink}`,
              boxShadow: `3px 3px 0 ${colors.ink}`,
              cursor: "pointer",
            }}
          >
            OPTIMIZE DISPATCH (HUNGARIAN)
          </button>

          <Link
            href="/command"
            style={{
              fontFamily: "var(--font-display)",
              padding: "8px 18px",
              background: colors.washiCard,
              color: colors.ink,
              fontWeight: 700,
              fontSize: "0.85rem",
              textDecoration: "none",
              border: `2px solid ${colors.ink}`,
              boxShadow: `3px 3px 0 ${colors.ink}`,
            }}
          >
            ← COMMAND MAP
          </Link>
        </div>
      </div>

      {allocationMsg && (
        <div
          style={{
            background: colors.washiCard,
            border: `2px solid ${colors.indigo}`,
            color: colors.indigo,
            padding: "10px 16px",
            marginBottom: 20,
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            boxShadow: `3px 3px 0 ${colors.ink}`,
            fontWeight: 600,
          }}
        >
          {allocationMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, fontFamily: "var(--font-display)", color: colors.indigo }}>
          Loading resource registries...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Evacuation Shelters Section */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 700,
                color: colors.surface,
                letterSpacing: "0.06em",
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `2px solid ${colors.ink}`,
                paddingBottom: 6,
              }}
            >
              <span>EVACUATION SHELTERS ({shelters.length})</span>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: colors.indigo }}>
                TOTAL CAPACITY: {shelters.reduce((acc, s) => acc + s.capacity, 0).toLocaleString()}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {shelters.map((s) => {
                const pct = s.capacity > 0 ? (s.occupancy / s.capacity) * 100 : 0;
                return (
                  <div
                    key={s.id}
                    style={{
                      background: colors.washiCard,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                      padding: "var(--space-3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.ink }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.65, marginTop: 2 }}>
                          REF: #{s.id} · {s.lat.toFixed(4)}°N, {s.lng.toFixed(4)}°E
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.7rem",
                          background: s.status === "open" ? colors.pine : colors.vermilion,
                          color: colors.washi,
                          border: `1.5px solid ${colors.ink}`,
                          padding: "2px 8px",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Capacity bar */}
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, opacity: 0.75 }}>
                          Occupancy Rate
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", color: colors.surface, fontWeight: 700 }}>
                          {s.occupancy} / {s.capacity} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 10,
                          background: colors.washi,
                          border: `1.5px solid ${colors.ink}`,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: pct > 80 ? colors.vermilion : colors.indigo,
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
                fontSize: "1rem",
                fontWeight: 700,
                color: colors.surface,
                letterSpacing: "0.06em",
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `2px solid ${colors.ink}`,
                paddingBottom: 6,
              }}
            >
              <span>FIELD RESPONSE TEAMS ({teams.length})</span>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: colors.pine, fontWeight: 700 }}>
                {teams.filter((t) => t.status === "available").length} READY FOR DISPATCH
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {teams.map((tm) => {
                const statCol = TEAM_STATUS_COLOR[tm.status] ?? colors.ink;
                return (
                  <div
                    key={tm.id}
                    style={{
                      background: colors.washiCard,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                      padding: "var(--space-3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.ink }}>
                          {tm.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.65, marginTop: 2 }}>
                          TYPE: {tm.type.toUpperCase()} · POSITION: {tm.lat.toFixed(4)}°N, {tm.lng.toFixed(4)}°E
                        </div>
                      </div>

                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.7rem",
                          background: statCol,
                          color: colors.washi,
                          border: `1.5px solid ${colors.ink}`,
                          padding: "2px 8px",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {tm.status.toUpperCase()}
                      </span>
                    </div>

                    {tm.incident_id && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "8px 12px",
                          background: colors.washi,
                          border: `1.5px solid ${colors.ink}`,
                          borderLeft: `5px solid ${colors.vermilion}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.8rem",
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
                          Dispatched to Incident #{tm.incident_id.slice(0, 8)}
                        </span>
                        <Link
                          href={`/incidents/${tm.incident_id}`}
                          style={{
                            color: colors.vermilion,
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
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
