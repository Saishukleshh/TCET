"use client";

import { colors, severityColor } from "@/lib/design-tokens";

export interface PendingAlert {
  id: string;
  tier: "critical" | "warning" | "watch";
  zone_id: string;
  message: string;
  status: "pending" | "approved" | "sent" | "rejected";
  created_at?: string;
}

interface ApprovalCardProps {
  alert: PendingAlert;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

export default function ApprovalCard({
  alert,
  onApprove,
  onReject,
  isLoading = false,
}: ApprovalCardProps) {
  const tierColor = severityColor[alert.tier] ?? colors.vermilion;

  return (
    <div
      style={{
        background: colors.washiCard,
        border: `3px solid ${colors.ink}`,
        boxShadow: `5px 5px 0 ${colors.ink}`,
        padding: "var(--space-3)",
        position: "relative",
        color: colors.ink,
      }}
    >
      {/* Red Seal / Hanko Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-2)",
          borderBottom: `2px solid ${colors.ink}`,
          paddingBottom: "var(--space-1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              background: colors.vermilion,
              border: `1px solid ${colors.ink}`,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: colors.ink,
              letterSpacing: "0.06em",
            }}
          >
            COMMAND SEAL REQUIRED
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            border: `2px solid ${tierColor}`,
            color: tierColor,
            fontWeight: 800,
            padding: "2px 8px",
            letterSpacing: "0.08em",
          }}
        >
          {alert.tier.toUpperCase()} TIER
        </span>
      </div>

      {/* Message content */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.95rem",
          color: colors.ink,
          lineHeight: 1.5,
          marginBottom: "var(--space-3)",
        }}
      >
        {alert.message}
      </p>

      {/* Protocol Banner */}
      <div
        style={{
          background: colors.washiMuted,
          borderLeft: `4px solid ${colors.indigo}`,
          padding: "8px 12px",
          marginBottom: "var(--space-3)",
          fontSize: "0.8rem",
          color: colors.ink,
          lineHeight: 1.4,
        }}
      >
        Strict Human-in-the-Loop Protocol: Emergency broadcast and field resource dispatch mandate authorized commander signature.
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button
          onClick={() => onApprove(alert.id)}
          disabled={isLoading}
          style={{
            flex: 2,
            background: colors.vermilion,
            color: "#FAF4E8",
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            padding: "10px 16px",
            border: `2px solid ${colors.ink}`,
            boxShadow: `3px 3px 0 ${colors.ink}`,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "AUTHORIZING..." : "AFFIX SEAL & TRANSMIT"}
        </button>

        <button
          onClick={() => onReject(alert.id)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: "transparent",
            color: colors.ink,
            fontFamily: "var(--font-display)",
            fontSize: "0.85rem",
            letterSpacing: "0.05em",
            padding: "10px 12px",
            border: `2px solid ${colors.ink}`,
            boxShadow: `2px 2px 0 ${colors.ink}`,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          DISMISS
        </button>
      </div>
    </div>
  );
}
