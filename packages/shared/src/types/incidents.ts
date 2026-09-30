import type { GeoPoint } from "./geo";

/** Incident verification status — never deviate from these three values. */
export type VerificationStatus = "verified" | "probable" | "unverified";

/** Alert tier — maps to colour in design.md. */
export type AlertTier = "watch" | "warning" | "critical";

/** Evidence bundle attached to an incident. */
export interface Evidence {
  reportCount: number;
  imageResult: ImageVerificationResult | null;
  rainfallMmH: number | null;
  sources: string[];
}

export interface ImageVerificationResult {
  showsFlooding: boolean;
  depthEstimate: string | null; // e.g. "ankle", "knee", "waist+"
  confidence: number; // 0-1
  modelUsed: string;
}

export interface Incident {
  id: string;
  geom: GeoPoint;
  severity: AlertTier;
  status: VerificationStatus;
  confidence: number; // 0-1
  reportCount: number;
  evidence: Evidence;
  recommendedAction: string;
  assignedTeamId: string | null;
  createdAt: string; // ISO UTC
  updatedAt: string; // ISO UTC
}

export interface IncidentListItem
  extends Pick<Incident, "id" | "severity" | "status" | "confidence" | "reportCount" | "createdAt" | "updatedAt"> {
  lat: number;
  lng: number;
}
