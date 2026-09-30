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
        background: colors.washi,
        color: colors.ink,
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: colors.surface,
          borderBottom: `3px solid ${colors.ink}`,
          padding: "var(--space-2) var(--space-3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: colors.pine,
              border: `2px solid ${colors.washi}`,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-hero)",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: colors.washi,
                letterSpacing: "0.06em",
              }}
            >
              TACTICAL UNIT: RESCUE ALPHA (TEAM-001)
            </div>
            <div style={{ fontSize: "0.75rem", color: colors.ochre, fontFamily: "var(--font-mono)" }}>
              FIELD RESPONDER HUD · MISSION ACTIVE · SAFE CORRIDOR ENGAGED
            </div>
          </div>
        </div>

        <Link
          href="/command"
          style={{
            fontFamily: "var(--font-display)",
            padding: "8px 16px",
            background: colors.vermilion,
            color: colors.washi,
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 700,
            border: `2px solid ${colors.ink}`,
            boxShadow: `2px 2px 0 ${colors.ink}`,
            letterSpacing: "0.06em",
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
            background: colors.washi,
            borderRight: `3px solid ${colors.ink}`,
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
              background: colors.washiCard,
              border: `3px solid ${colors.ink}`,
              boxShadow: `4px 4px 0 ${colors.ink}`,
              padding: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  color: colors.vermilion,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                MISSION DISPATCH DIRECTIVE
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  background: colors.vermilion,
                  color: colors.washi,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "3px 8px",
                  border: `1.5px solid ${colors.ink}`,
                  letterSpacing: "0.06em",
                }}
              >
                CRITICAL
              </span>
            </div>

            <div
              style={{
                fontFamily: "var(--font-hero)",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: colors.surface,
                marginBottom: 6,
              }}
            >
              Evacuation & Rescue — Kurla West Cluster
            </div>

            <p style={{ fontSize: "0.85rem", fontFamily: "var(--font-body)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
              17 corroborating citizen reports confirm deep street waterlogging and stalled vehicles. Proceed via
              verified safe corridor avoiding inundated LBS Marg arterial.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                background: colors.washi,
                border: `1.5px solid ${colors.ink}`,
                padding: "10px 12px",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
              }}
            >
              <div>
                <span style={{ opacity: 0.65, fontFamily: "var(--font-display)", fontSize: "0.7rem" }}>DESTINATION:</span>
                <div style={{ color: colors.indigo, fontWeight: 700, fontSize: "0.85rem" }}>Dharavi Shelter</div>
              </div>
              <div>
                <span style={{ opacity: 0.65, fontFamily: "var(--font-display)", fontSize: "0.7rem" }}>CAPACITY:</span>
                <div style={{ color: colors.pine, fontWeight: 700, fontSize: "0.85rem" }}>300 (Open)</div>
              </div>
              <div>
                <span style={{ opacity: 0.65, fontFamily: "var(--font-display)", fontSize: "0.7rem" }}>SAFE CORRIDOR:</span>
                <div style={{ color: colors.ink, fontWeight: 700, fontSize: "0.85rem" }}>
                  {routeInfo ? `${(routeInfo.distance_m / 1000).toFixed(1)} km` : "1.2 km"}
                </div>
              </div>
              <div>
                <span style={{ opacity: 0.65, fontFamily: "var(--font-display)", fontSize: "0.7rem" }}>EST. TIME:</span>
                <div style={{ color: colors.ochre, fontWeight: 700, fontSize: "0.85rem" }}>
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
                fontSize: "0.85rem",
                fontWeight: 700,
                color: colors.surface,
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              FIELD RESPONDER OPERATIONAL STATUS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { key: "assigned", label: "ASSIGNED", col: colors.ochre, textColor: colors.ink },
                { key: "en_route", label: "EN ROUTE", col: colors.vermilion, textColor: colors.washi },
                { key: "on_scene", label: "ON SCENE", col: colors.indigo, textColor: colors.washi },
                { key: "evacuating", label: "EVACUATING", col: colors.surface, textColor: colors.washi },
                { key: "complete", label: "MISSION DONE", col: colors.pine, textColor: colors.washi },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setStatus(st.key as any)}
                  style={{
                    padding: "10px 8px",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.8rem",
                    letterSpacing: "0.05em",
                    background: status === st.key ? st.col : colors.washiCard,
                    color: status === st.key ? st.textColor : colors.ink,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: status === st.key ? `3px 3px 0 ${colors.ink}` : `1px 1px 0 ${colors.ink}`,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {status === st.key ? `[x] ${st.label}` : st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Safe Corridor Protocol Note */}
          <div
            style={{
              background: colors.washiCard,
              border: `2px solid ${colors.pine}`,
              padding: "12px",
              fontSize: "0.8rem",
              lineHeight: 1.5,
              boxShadow: `2px 2px 0 ${colors.ink}`,
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: colors.pine, marginBottom: 4 }}>
              DYNAMIC EVACUATION ROUTING
            </div>
            Our OSRM engine automatically computes corridors around flooded hazard polygons and blocked segments.
            If route conditions deteriorate, the path recalculates avoiding all active flood polygons.
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
