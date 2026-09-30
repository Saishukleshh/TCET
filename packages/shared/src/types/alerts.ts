import type { AlertTier } from "./incidents";

export type AlertStatus = "pending" | "approved" | "sent" | "rejected";

export interface Alert {
  id: string;
  tier: AlertTier;
  zoneId: string;
  message: string;
  status: AlertStatus;
  approvedBy: string | null;
  createdAt: string; // ISO UTC
}

export interface AlertApprovalRequest {
  approvedBy: string;
}
