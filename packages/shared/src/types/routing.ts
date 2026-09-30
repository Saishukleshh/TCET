import type { GeoLineString } from "./geo";

export interface EvacuationRouteRequest {
  fromLng: number;
  fromLat: number;
  toLng: number;
  toLat: number;
}

export type RouteStatus = "safe" | "no_safe_route";

export interface EvacuationRoute {
  status: RouteStatus;
  geom: GeoLineString | null; // null when no safe route
  distanceM: number | null;
  durationSec: number | null;
  warningMessage: string | null;
}
