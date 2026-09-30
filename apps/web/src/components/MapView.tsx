"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { colors } from "@/lib/design-tokens";

// Configure MapLibre worker url to use locally served worker bundle
if (typeof window !== "undefined" && typeof (maplibregl as any).setWorkerUrl === "function") {
  (maplibregl as any).setWorkerUrl("/maplibre-gl-worker.mjs");
}


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
  critical: colors.vermilion,
  warning: colors.ochre,
  watch: colors.indigo,
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
  const [loaded, setLoaded] = useState(false);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let isMounted = true;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors · Ukiyo-e Cartography",
          },
        },
        layers: [
          {
            id: "osm_woodblock_layer",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
            paint: {
              // Aged washi paper warm cartographic styling
              "raster-brightness-max": 0.94,
              "raster-brightness-min": 0.08,
              "raster-contrast": 0.15,
              "raster-saturation": -0.65,
              "raster-hue-rotate": 35, // warm washi paper tone
            },
          },
        ],
      },
      center,
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // ── 1. Zone Risk Polygons ──────────────────────────────────
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
            0.0, "rgba(45, 127, 103, 0.35)",  // Pine green (Safe)
            0.25, "rgba(42, 64, 86, 0.40)",    // Indigo (Watch)
            0.45, "rgba(204, 119, 34, 0.55)",  // Ochre (Warning)
            0.70, "rgba(232, 93, 53, 0.70)",   // Vermilion (Critical)
            1.0, "rgba(232, 93, 53, 0.85)",
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
            0.0, colors.pine,
            0.25, colors.indigo,
            0.45, colors.ochre,
            0.70, colors.vermilion,
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
          "line-color": colors.ink,
          "line-width": 8,
        },
      });

      map.addLayer({
        id: "blocked-roads-line",
        type: "line",
        source: "blocked-roads",
        paint: {
          "line-color": colors.vermilion,
          "line-width": 5,
          "line-dasharray": [3, 2],
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
          "line-color": colors.ink,
          "line-width": 8,
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": colors.pine,
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
          "circle-radius": 10,
          "circle-color": colors.prussian,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": colors.washiCard,
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
          "circle-radius": 9,
          "circle-color": colors.ochre,
          "circle-stroke-width": 2,
          "circle-stroke-color": colors.ink,
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
            1, 16,
            10, 26,
            23, 36,
          ],
          "circle-color": [
            "match",
            ["get", "severity"],
            "critical", "rgba(232, 93, 53, 0.25)",
            "warning", "rgba(204, 119, 34, 0.25)",
            "rgba(42, 64, 86, 0.25)",
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": [
            "match",
            ["get", "severity"],
            "critical", colors.vermilion,
            "warning", colors.ochre,
            colors.indigo,
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
            1, 9,
            10, 15,
            23, 20,
          ],
          "circle-color": [
            "match",
            ["get", "severity"],
            "critical", colors.vermilion,
            "warning", colors.ochre,
            colors.indigo,
          ],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": colors.ink,
        },
      });

      // Interactions
      map.on("click", "zones-fill", (e: any) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const zoneId = feature.properties?.id;
        const found = zones.find((z) => z.properties.id === zoneId);
        if (found && onSelectZone) {
          onSelectZone(found);
        }
      });

      map.on("click", "incidents-circle", (e: any) => {
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
    });

    if (!isMounted) {
      map?.remove();
      return;
    }
    mapRef.current = map;

    // Responsive container resize observer
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setLoaded(false);
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
      className="map-container relative w-full h-full min-h-[320px] md:min-h-[450px]"
      aria-label="AEGISFLOW Map"

    />
  );
}
