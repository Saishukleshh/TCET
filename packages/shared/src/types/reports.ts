import type { GeoPoint } from "./geo";
import type { VerificationStatus } from "./incidents";

export type DepthHint = "ankle" | "knee" | "waist+";

export interface ReportSubmission {
  lat: number;
  lng: number;
  text: string;
  imageUrl?: string;
  depthHint?: DepthHint;
  source?: string; // defaults to "citizen"; set to "simulated" for injected rows
}

export interface Report {
  id: string;
  geom: GeoPoint;
  text: string;
  imageUrl: string | null;
  depthHint: DepthHint | null;
  ts: string; // ISO UTC
  clusterId: string | null;
  incidentId: string | null;
  verification: VerificationStatus;
  confidence: number; // 0-1
  source: string; // "citizen" | "simulated"
}
