"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { colors } from "@/lib/design-tokens";

export interface ZoneFeature {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: number[][][] };
  properties: {
    id: string;
    name: string;
    risk?: number;
    factors?: {
      rain_norm: number;
      low_elevation: number;
      history: number;
      incident_density: number;
    };
    rainfall_mm_h?: number;
    population_exposed?: number;
    elevation_m?: number;
    vulnerability?: number;
  };
}

export interface IncidentMarker {
  id: string;
  lat: number;
  lng: number;
  severity: "critical" | "warning" | "watch";
  status: string;
  confidence: number;
  report_count: number;
  created_at?: string;
  recommended_action?: string;
}

export interface ShelterMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
  status: string;
}

export interface TeamMarker {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  status: string;
  incident_id?: string | null;
}

export interface BlockedRoad {
  id: string;
  geom: {
    type: "LineString";
    coordinates: number[][];
  };
  reason: string;
}

export interface RouteGeoJSON {
  type: "LineString";
  coordinates: number[][];
}

interface MapViewProps {
  zones?: ZoneFeature[];
  incidents?: IncidentMarker[];
  shelters?: ShelterMarker[];
  teams?: TeamMarker[];
  blockedRoads?: BlockedRoad[];
  route?: RouteGeoJSON | null;
  showZones?: boolean;
  showIncidents?: boolean;
  showShelters?: boolean;
  showTeams?: boolean;
  showBlockedRoads?: boolean;
  showRoute?: boolean;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  onSelectZone?: (zone: ZoneFeature) => void;
  onSelectIncident?: (incidentId: string) => void;
  onMapLoad?: (map: MapLibreMap) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: colors.vermelho,
  warning: colors.laranja,
  watch: colors.amareloNeon,
};

export default function MapView({
  zones = [],
  incidents = [],
  shelters = [],
  teams = [],
  blockedRoads = [],
  route = null,
  showZones = true,
  showIncidents = true,
  showShelters = true,
  showTeams = true,
  showBlockedRoads = true,
  showRoute = true,
  center = [72.875, 19.068],
  zoom = 13.5,
  onSelectZone,
  onSelectIncident,
  onMapLoad,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const maplibreglRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: MapLibreMap;

    import("maplibre-gl").then((maplibregl) => {
      maplibreglRef.current = maplibregl;
      const { Map, NavigationControl } = maplibregl;

      map = new Map({
        container: containerRef.current!,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm_dark_layer",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 19,
              paint: {
                "raster-brightness-max": 0.45,
                "raster-brightness-min": 0.05,
                "raster-contrast": 0.35,
                "raster-saturation": -0.85,
              },
            },
          ],
        },
        center,
        zoom,
      });

      map.addControl(new NavigationControl(), "top-right");

      map.on("load", () => {
        // ── 1. Zone risk layer ──────────────────────────────────────
        map.addSource("zones", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "zones-fill",
          type: "fill",
          source: "zones",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "risk"], 0],
              0.0,
              "rgba(0, 255, 0, 0.25)",
              0.25,
              "rgba(255, 255, 0, 0.35)",
              0.45,
              "rgba(255, 102, 0, 0.45)",
              0.7,
              "rgba(255, 0, 0, 0.6)",
              1.0,
              "rgba(255, 0, 0, 0.75)",
            ],
            "fill-opacity": 0.85,
          },
        });

        map.addLayer({
          id: "zones-outline",
          type: "line",
          source: "zones",
          paint: {
            "line-color": [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "risk"], 0],
              0.0,
              colors.verdeNeon,
              0.25,
              colors.amareloNeon,
              0.45,
              colors.laranja,
              0.7,
              colors.vermelho,
            ],
            "line-width": 3,
          },
        });

        // ── 2. Blocked Roads layer ──────────────────────────────────
        map.addSource("blocked-roads", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "blocked-roads-casing",
          type: "line",
          source: "blocked-roads",
          paint: {
            "line-color": "#000000",
            "line-width": 8,
          },
        });

        map.addLayer({
          id: "blocked-roads-line",
          type: "line",
          source: "blocked-roads",
          paint: {
            "line-color": colors.vermelho,
            "line-width": 5,
            "line-dasharray": [2, 1],
          },
        });

        // ── 3. Evacuation Route layer ───────────────────────────────
        map.addSource("route", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "route-casing",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#000000",
            "line-width": 8,
          },
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": colors.verdeNeon,
            "line-width": 5,
          },
        });

        // ── 4. Shelters layer ───────────────────────────────────────
        map.addSource("shelters", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "shelters-circle",
          type: "circle",
          source: "shelters",
          paint: {
            "circle-radius": 9,
            "circle-color": colors.azulFosco,
            "circle-stroke-width": 2,
            "circle-stroke-color": colors.branco,
          },
        });

        // ── 5. Teams layer ──────────────────────────────────────────
        map.addSource("teams", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "teams-circle",
          type: "circle",
          source: "teams",
          paint: {
            "circle-radius": 8,
            "circle-color": colors.rosaNeon,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#000",
          },
        });

        // ── 6. Incidents layer ──────────────────────────────────────
        map.addSource("incidents", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "incidents-pulse",
          type: "circle",
          source: "incidents",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "report_count"],
              1,
              16,
              10,
              26,
              23,
              36,
            ],
            "circle-color": [
              "match",
              ["get", "severity"],
              "critical",
              "rgba(255, 0, 0, 0.3)",
              "warning",
              "rgba(255, 102, 0, 0.3)",
              "rgba(255, 255, 0, 0.3)",
            ],
            "circle-stroke-width": 1,
            "circle-stroke-color": [
              "match",
              ["get", "severity"],
              "critical",
              colors.vermelho,
              "warning",
              colors.laranja,
              colors.amareloNeon,
            ],
          },
        });

        map.addLayer({
          id: "incidents-circle",
          type: "circle",
          source: "incidents",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "report_count"],
              1,
              9,
              10,
              15,
              23,
              20,
            ],
            "circle-color": [
              "match",
              ["get", "severity"],
              "critical",
              colors.vermelho,
              "warning",
              colors.laranja,
              colors.amareloNeon,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#000",
          },
        });

        // Interactions
        map.on("click", "zones-fill", (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const zoneId = feature.properties?.id;
          const found = zones.find((z) => z.properties.id === zoneId);
          if (found && onSelectZone) {
            onSelectZone(found);
          }
        });

        map.on("click", "incidents-circle", (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const incId = String(feature.properties?.id);
          if (onSelectIncident) {
            onSelectIncident(incId);
          }
        });

        map.on("mouseenter", "incidents-circle", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "incidents-circle", () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("mouseenter", "zones-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "zones-fill", () => {
          map.getCanvas().style.cursor = "";
        });

        setLoaded(true);
        onMapLoad?.(map);
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update zones source
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const src = mapRef.current.getSource("zones") as any;
    if (src) {
      src.setData({
        type: "FeatureCollection",
        features: showZones ? zones : [],
      });
    }
  }, [zones, showZones, loaded]);

  // Update incidents source
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const src = mapRef.current.getSource("incidents") as any;
    if (src) {
      src.setData({
        type: "FeatureCollection",
        features: showIncidents
          ? incidents.map((inc) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [inc.lng, inc.lat] },
              properties: {
                id: inc.id,
                severity: inc.severity,
                status: inc.status,
                confidence: inc.confidence,
                report_count: inc.report_count,
              },
            }))
          : [],
      });
    }
  }, [incidents, showIncidents, loaded]);

  // Update route source
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const src = mapRef.current.getSource("route") as any;
    if (src) {
      src.setData(
        showRoute && route
          ? {
              type: "FeatureCollection",
              features: [{ type: "Feature", geometry: route, properties: {} }],
            }
          : { type: "FeatureCollection", features: [] }
      );
    }
  }, [route, showRoute, loaded]);

  // Update blocked roads source
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const src = mapRef.current.getSource("blocked-roads") as any;
    if (src) {
      src.setData({
        type: "FeatureCollection",
        features:
          showBlockedRoads && blockedRoads
            ? blockedRoads.map((br) => ({
                type: "Feature",
                geometry: br.geom,
                properties: { id: br.id, reason: br.reason },
              }))
            : [],
      });
    }
  }, [blockedRoads, showBlockedRoads, loaded]);

  // Update shelters source
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const src = mapRef.current.getSource("shelters") as any;
    if (src) {
      src.setData({
        type: "FeatureCollection",
        features: showShelters
          ? shelters.map((sh) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [sh.lng, sh.lat] },
              properties: {
                id: sh.id,
                name: sh.name,
                capacity: sh.capacity,
                occupancy: sh.occupancy,
                status: sh.status,
              },
            }))
          : [],
      });
    }
  }, [shelters, showShelters, loaded]);

  // Update teams source
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const src = mapRef.current.getSource("teams") as any;
    if (src) {
      src.setData({
        type: "FeatureCollection",
        features: showTeams
          ? teams.map((tm) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [tm.lng, tm.lat] },
              properties: {
                id: tm.id,
                name: tm.name,
                type: tm.type,
                status: tm.status,
              },
            }))
          : [],
      });
    }
  }, [teams, showTeams, loaded]);

  return (
    <div
      ref={containerRef}
      className="map-container relative w-full h-full min-h-[450px]"
      aria-label="AEGISFLOW Map"
    />
  );
}
