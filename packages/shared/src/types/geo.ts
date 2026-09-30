// Geo primitives — [lng, lat] everywhere (GeoJSON convention).
// PostGIS uses ST_MakePoint(lng, lat). Never swap the order.

export type LngLat = [number, number]; // [lng, lat]

export interface GeoPoint {
  type: "Point";
  coordinates: LngLat;
}

export interface GeoPolygon {
  type: "Polygon";
  coordinates: LngLat[][];
}

export interface GeoLineString {
  type: "LineString";
  coordinates: LngLat[];
}

export type Geometry = GeoPoint | GeoPolygon | GeoLineString;

export interface GeoFeature<G extends Geometry = Geometry, P = Record<string, unknown>> {
  type: "Feature";
  geometry: G;
  properties: P;
}

export interface GeoFeatureCollection<G extends Geometry = Geometry, P = Record<string, unknown>> {
  type: "FeatureCollection";
  features: GeoFeature<G, P>[];
}
