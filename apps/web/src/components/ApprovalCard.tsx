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
  const tierColor = severityColor[alert.tier] ?? colors.vermelho;

  return (
    <div
      style={{
        background: "var(--surface-overlay)",
        border: `4px solid ${tierColor}`,
        boxShadow: "0 0 20px rgba(255, 0, 0, 0.4), 6px 6px 0 #000000",
        padding: "var(--space-3)",
        borderRadius: "var(--radius-md)",
        position: "relative",
      }}
    >
      {/* Alert Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-2)",
          borderBottom: "1px solid var(--surface-border)",
          paddingBottom: "var(--space-1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: tierColor,
              boxShadow: `0 0 8px ${tierColor}`,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              color: tierColor,
              letterSpacing: "0.08em",
            }}
          >
            COMMAND APPROVAL REQUIRED
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            background: tierColor,
            color: "#000",
            fontWeight: 800,
            padding: "2px 8px",
            letterSpacing: "0.05em",
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
          color: "var(--color-branco)",
          lineHeight: 1.45,
          marginBottom: "var(--space-3)",
        }}
      >
        {alert.message}
      </p>

      {/* Warning banner */}
      <div
        style={{
          background: "rgba(255, 16, 240, 0.1)",
          borderLeft: `4px solid ${colors.rosaNeon}`,
          padding: "6px 12px",
          marginBottom: "var(--space-3)",
          fontSize: "0.8rem",
          color: "var(--color-branco)",
        }}
      >
        Human-in-the-loop: Emergency broadcast to citizens & field dispatch requires command authorization.
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button
          onClick={() => onApprove(alert.id)}
          disabled={isLoading}
          style={{
            flex: 2,
            background: colors.verdeNeon,
            color: "#000000",
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "10px 16px",
            border: "2px solid #000000",
            boxShadow: "3px 3px 0 #000000",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 150ms ease",
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translate(2px, 2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "1px 1px 0 #000";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "none";
            (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 #000";
          }}
        >
          {isLoading ? "AUTHORIZING..." : "✓ APPROVE & SEND ALERT"}
        </button>

        <button
          onClick={() => onReject(alert.id)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: "transparent",
            color: "var(--color-branco)",
            fontFamily: "var(--font-display)",
            fontSize: "0.9rem",
            letterSpacing: "0.05em",
            padding: "10px 12px",
            border: "1px solid var(--surface-border)",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: 0.8,
          }}
        >
          REJECT
        </button>
      </div>
    </div>
  );
}
