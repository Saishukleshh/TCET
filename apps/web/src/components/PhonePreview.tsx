"use client";

import { useState } from "react";
import { colors } from "@/lib/design-tokens";

export interface AlertTranslations {
  en: string;
  hi: string;
  mr: string;
}

interface PhonePreviewProps {
  translations: AlertTranslations;
  tier: "critical" | "warning" | "watch";
}

const TIER_COLOR: Record<string, string> = {
  critical: colors.vermilion,
  warning: colors.ochre,
  watch: colors.indigo,
};

const LANG_LABELS = [
  { key: "en" as const, label: "EN", script: "English" },
  { key: "hi" as const, label: "हिन्दी", script: "Hindi" },
  { key: "mr" as const, label: "मराठी", script: "Marathi" },
];

export default function PhonePreview({ translations, tier }: PhonePreviewProps) {
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "mr">("en");
  const tierColor = TIER_COLOR[tier] ?? colors.vermilion;
  const isDevanagari = activeLang === "hi" || activeLang === "mr";
  const message = translations[activeLang] ?? translations.en;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Language tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: `2px solid ${colors.ink}`,
          paddingBottom: 6,
        }}
      >
        {LANG_LABELS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActiveLang(l.key)}
            style={{
              padding: "4px 12px",
              fontFamily: isDevanagari && l.key !== "en"
                ? "'Noto Sans Devanagari', sans-serif"
                : "var(--font-display)",
              fontSize: "0.8rem",
              fontWeight: 700,
              background: activeLang === l.key ? colors.ink : colors.washiMuted,
              color: activeLang === l.key ? colors.washiCard : colors.ink,
              border: `1.5px solid ${colors.ink}`,
              cursor: "pointer",
              letterSpacing: l.key === "en" ? "0.05em" : 0,
            }}
          >
            {l.label}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.65rem",
            fontFamily: "var(--font-mono)",
            color: colors.ink,
            opacity: 0.5,
            alignSelf: "center",
          }}
        >
          {message.length}/300 chars
        </span>
      </div>

      {/* Phone frame */}
      <div
        style={{
          background: colors.ink,
          borderRadius: 16,
          padding: "10px 8px 14px",
          border: `3px solid ${colors.ink}`,
          boxShadow: `4px 4px 0 ${colors.ink}`,
          maxWidth: 320,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 8px 6px",
            fontSize: "0.6rem",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>AEGISFLOW ALERT</span>
          <span>SMS / WhatsApp</span>
        </div>

        {/* Chat bubble */}
        <div
          style={{
            background: "#1a1a2e",
            borderRadius: "12px 12px 12px 2px",
            padding: "10px 14px",
            margin: "0 4px",
            borderLeft: `4px solid ${tierColor}`,
          }}
        >
          {/* Tier badge */}
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              fontWeight: 800,
              color: tierColor,
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            {tier.toUpperCase()} · AEGISFLOW
          </div>

          {/* Message text */}
          <p
            style={{
              margin: 0,
              fontSize: isDevanagari ? "0.9rem" : "0.82rem",
              lineHeight: 1.55,
              color: "#FAF4E8",
              fontFamily: isDevanagari
                ? "'Noto Sans Devanagari', 'Noto Sans', sans-serif"
                : "var(--font-body)",
              wordBreak: "break-word",
            }}
          >
            {message}
          </p>

          {/* Timestamp */}
          <div
            style={{
              textAlign: "right",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-mono)",
              marginTop: 6,
            }}
          >
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
          </div>
        </div>
      </div>
    </div>
  );
}
