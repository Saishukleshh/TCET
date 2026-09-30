"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { colors } from "@/lib/design-tokens";
import MapView, { RouteGeoJSON } from "@/components/MapView";
import { computeEvacuationRoute, fetchIncidents, fetchShelters } from "@/lib/api-client";

export default function ResponderPage() {
  const [status, setStatus] = useState<"assigned" | "en_route" | "on_scene" | "evacuating" | "complete">("assigned");
  const [route, setRoute] = useState<RouteGeoJSON | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance_m: number; duration_sec: number; status: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);

  // Fetch safe evacuation route for the responder
  useEffect(() => {
    // Demo mission: From Kurla waterlogged hotspot (72.8745, 19.0670) to Dharavi Community Hall (72.8681, 19.0685)
    computeEvacuationRoute({
      from_lat: 19.0670,
      from_lng: 72.8745,
      to_lat: 19.0685,
      to_lng: 72.8681,
    })
      .then((res) => {
        if (res.geom) {
          setRoute(res.geom);
          setRouteInfo({
            distance_m: res.distance_m ?? 1240,
            duration_sec: res.duration_sec ?? 420,
            status: res.status ?? "safe",
          });
        }
      })
      .catch((err) => console.error("Error computing responder route", err))
      .finally(() => setLoadingRoute(false));
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-base)",
        color: "var(--color-branco)",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: "var(--surface-overlay)",
          borderBottom: "2px solid var(--surface-border)",
          padding: "var(--space-2) var(--space-3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: colors.verdeNeon,
              boxShadow: `0 0 10px ${colors.verdeNeon}`,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-accent)",
                fontSize: "1.25rem",
                color: colors.verdeNeon,
                letterSpacing: "0.08em",
              }}
            >
              UNIT: RESCUE ALPHA (TEAM-001)
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.6, fontFamily: "var(--font-mono)" }}>
              FIELD RESPONDER HUD · MISSION ACTIVE
            </div>
          </div>
        </div>

        <Link
          href="/command"
          style={{
            fontFamily: "var(--font-display)",
            padding: "6px 12px",
            background: colors.amareloNeon,
            color: "#000",
            textDecoration: "none",
            fontSize: "0.8rem",
            border: "2px solid #000",
            boxShadow: "2px 2px 0 #000",
          }}
        >
          COMMAND CENTER →
        </Link>
      </header>

      {/* Main Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Mission Card Panel */}
        <div
          style={{
            width: 440,
            background: "var(--surface-overlay)",
            borderRight: "2px solid var(--surface-border)",
            padding: "var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            overflowY: "auto",
          }}
        >
          {/* Mission Objective Card */}
          <div
            style={{
              background: "var(--surface-card)",
              border: `3px solid ${colors.vermelho}`,
              boxShadow: "4px 4px 0 #000",
              padding: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  color: colors.vermelho,
                  fontSize: "1rem",
                  letterSpacing: "0.08em",
                }}
              >
                CURRENT ASSIGNMENT
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  background: colors.vermelho,
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  padding: "2px 6px",
                }}
              >
                CRITICAL
              </span>
            </div>

            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", marginBottom: 4 }}>
              Evacuation & Rescue — Kurla West Cluster
            </div>

            <p style={{ fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.4, margin: "0 0 12px 0" }}>
              17 corroborating citizen reports confirm deep street waterlogging and stalled vehicles. Proceed via
              verified safe corridor avoiding blocked LBS Marg.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                background: "var(--surface-base)",
                padding: "8px 12px",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
              }}
            >
              <div>
                <span style={{ opacity: 0.5 }}>DESTINATION:</span>
                <div style={{ color: colors.azulFosco, fontWeight: 700 }}>Dharavi Shelter</div>
              </div>
              <div>
                <span style={{ opacity: 0.5 }}>CAPACITY:</span>
                <div style={{ color: colors.verdeNeon, fontWeight: 700 }}>300 (Open)</div>
              </div>
              <div>
                <span style={{ opacity: 0.5 }}>SAFE DISTANCE:</span>
                <div style={{ color: "var(--color-branco)" }}>
                  {routeInfo ? `${(routeInfo.distance_m / 1000).toFixed(1)} km` : "1.2 km"}
                </div>
              </div>
              <div>
                <span style={{ opacity: 0.5 }}>EST. TRAVEL:</span>
                <div style={{ color: colors.amareloNeon, fontWeight: 700 }}>
                  {routeInfo ? `~${Math.round(routeInfo.duration_sec / 60)} min` : "~7 min"}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Status Control Buttons */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.8rem",
                opacity: 0.7,
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              UPDATE FIELD STATUS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { key: "assigned", label: "ASSIGNED", col: colors.amareloNeon },
                { key: "en_route", label: "EN ROUTE", col: colors.laranja },
                { key: "on_scene", label: "ON SCENE", col: colors.rosaNeon },
                { key: "evacuating", label: "EVACUATING", col: colors.azulFosco },
                { key: "complete", label: "MISSION DONE", col: colors.verdeNeon },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setStatus(st.key as any)}
                  style={{
                    padding: "10px 8px",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    letterSpacing: "0.05em",
                    background: status === st.key ? st.col : "var(--surface-card)",
                    color: status === st.key ? "#000" : "var(--color-branco)",
                    border: status === st.key ? "2px solid #000" : "1px solid var(--surface-border)",
                    boxShadow: status === st.key ? "2px 2px 0 #000" : "none",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  {status === st.key ? `✓ ${st.label}` : st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Safe Corridor Protocol Note */}
          <div
            style={{
              background: "rgba(0, 255, 0, 0.08)",
              border: `2px dashed ${colors.verdeNeon}`,
              padding: "12px",
              fontSize: "0.8rem",
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", color: colors.verdeNeon, marginBottom: 4 }}>
              DYNAMIC EVACUATION ROUTING
            </div>
            Our OSRM engine automatically recalculates around flooded zones and blocked roads. If a segment becomes
            impassable, the route will recalculate without crossing flood boundaries.
          </div>
        </div>

        {/* Right Map View */}
        <div style={{ flex: 1, position: "relative" }}>
          <MapView
            route={route}
            shelters={[
              {
                id: "shelter-001",
                name: "Dharavi Community Hall",
                lat: 19.0685,
                lng: 72.8681,
                capacity: 300,
                occupancy: 0,
                status: "open",
              },
            ]}
            teams={[
              {
                id: "team-001",
                name: "Rescue Alpha",
                type: "rescue",
                lat: 19.066,
                lng: 72.873,
                status: status,
              },
            ]}
            incidents={[
              {
                id: "inc-demo",
                lat: 19.067,
                lng: 72.8745,
                severity: "critical",
                status: "verified",
                confidence: 0.94,
                report_count: 17,
              },
            ]}
            center={[72.871, 19.068]}
            zoom={14.5}
          />
        </div>
      </div>
    </div>
  );
}
