import type { GeoPoint } from "./geo";

export type ShelterStatus = "open" | "full" | "closed";
export type TeamStatus = "available" | "assigned" | "en_route" | "deployed";

export interface Shelter {
  id: string;
  geom: GeoPoint;
  name: string;
  capacity: number;
  occupancy: number;
  status: ShelterStatus;
}

export interface Team {
  id: string;
  geom: GeoPoint;
  name: string;
  type: string; // e.g. "rescue", "medical", "fire"
  status: TeamStatus;
  incidentId: string | null;
}

export interface Assignment {
  id: string;
  incidentId: string;
  teamId: string;
  etaMin: number;
  approvedBy: string | null;
}

export interface AllocationRequest {
  incidentIds: string[];
}

export interface AllocationResult {
  assignments: Assignment[];
}
