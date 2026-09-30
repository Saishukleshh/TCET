import type { GeoFeatureCollection, GeoPolygon } from "./geo";

/** Flood-risk score for a single zone (explainable). */
export interface ZoneRiskScore {
  zoneId: string;
  zoneName: string;
  risk: number; // 0-1 composite
  // Factor breakdown — must always be returned so UI can show "why"
  factors: {
    rainNorm: number;     // weight 0.40
    lowElevation: number; // weight 0.25
    history: number;      // weight 0.20
    incidentDensity: number; // weight 0.15
  };
  rainfallMmH: number;
  populationExposed: number;
  updatedAt: string; // ISO UTC
}

export type ZoneProperties = ZoneRiskScore & {
  vulnerability: number; // 0-1 baseline
  elevationM: number;
};

/** GeoJSON FeatureCollection returned by GET /risk/zones */
export type ZoneRiskFeatureCollection = GeoFeatureCollection<GeoPolygon, ZoneProperties>;
