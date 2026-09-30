"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { colors } from "@/lib/design-tokens";
import { submitReport, fetchAlerts } from "@/lib/api-client";
import PhonePreview, { AlertTranslations } from "@/components/PhonePreview";

export default function ReportPage() {
  const [lat, setLat] = useState<number>(19.068);
  const [lng, setLng] = useState<number>(72.875);
  const [locationLabel, setLocationLabel] = useState<string>("Kurla West (default)");
  const [depth, setDepth] = useState<"ankle" | "knee" | "waist+" | null>("knee");
  const [text, setText] = useState<string>("Water rapidly accumulating near railway station subway. Vehicles stalled.");
  const [photoSelected, setPhotoSelected] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);
  const [sentAlert, setSentAlert] = useState<{ translations: AlertTranslations; tier: string } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationLabel(`${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
      },
      () => {
        // Permission denied or unavailable — keep hardcoded Kurla West fallback
        setLocationLabel("Kurla West (GPS unavailable)");
      },
      { timeout: 8000 }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitReport({
        lat,
        lng,
        text,
        depth_hint: depth,
        image_url: photoSelected ? "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80" : null,
        source: "citizen",
      });
      setSubmittedResult(res);
      // Fetch latest sent alert for multilingual preview
      try {
        const alerts = await fetchAlerts();
        const latest = alerts.find((a: any) => a.status === "sent" && a.translations);
        if (latest) setSentAlert({ translations: latest.translations, tier: latest.tier });
      } catch {}
    } catch (err) {
      console.error("Submission error", err);
      alert("Error submitting report. Please verify connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: colors.washi,
        color: colors.ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "var(--space-4) var(--space-2)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `2px solid ${colors.ink}`,
            paddingBottom: "var(--space-2)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-hero)",
                fontSize: "clamp(1.25rem, 3.5vw, 1.65rem)",
                fontWeight: 700,
                color: colors.surface,
                letterSpacing: "0.06em",
                display: "block",
              }}
            >
              CITIZEN FLOOD REPORTING DISPATCH
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: colors.vermilion,
                letterSpacing: "0.06em",
                fontWeight: 700,
                marginTop: 2,
              }}
            >
              RAPID CROWDSOURCED HAZARD INGESTION GRID
            </div>
          </div>
        </div>


        {submittedResult ? (
          /* Confirmation Result Card */
          <div
            style={{
              background: colors.washiCard,
              border: `3px solid ${colors.ink}`,
              boxShadow: `5px 5px 0 ${colors.ink}`,
              padding: "var(--space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  background: colors.pine,
                  color: colors.washi,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.2rem",
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                OK
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-hero)",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: colors.pine,
                  }}
                >
                  DISPATCH GEOTAGGED & VERIFIED
                </div>
                <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: colors.ink, opacity: 0.7 }}>
                  REPORT ID: #{submittedResult.id?.slice(0, 8)} · CLUSTER #{submittedResult.cluster_id?.slice(0, 8)}
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.9rem", fontFamily: "var(--font-body)", lineHeight: 1.5, margin: 0 }}>
              Your report has been logged onto the emergency grid, aggregated with nearby citizen telemetry, and
              forwarded to automated AI verification and municipal rescue dispatch.
            </p>

            {/* Nearest Safe Shelter Info */}
            <div
              style={{
                background: colors.washi,
                border: `2px solid ${colors.ink}`,
                borderLeft: `6px solid ${colors.indigo}`,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: colors.indigo,
                  letterSpacing: "0.06em",
                }}
              >
                NEAREST DESIGNATED SAFE SHELTER
              </div>
              <div style={{ fontFamily: "var(--font-hero)", fontSize: "1.05rem", fontWeight: 700, color: colors.ink }}>
                Kurla Municipal School (Shelter-002)
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.75, fontFamily: "var(--font-mono)" }}>
                Distance: ~400 meters · Status: OPEN · Safe Ingress Route Active
              </div>
            </div>

            {/* Active alert multilingual preview */}
            {sentAlert && (
              <div
                style={{
                  background: colors.washi,
                  border: `2px solid ${colors.ink}`,
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: colors.prussian,
                    letterSpacing: "0.06em",
                  }}
                >
                  ACTIVE EMERGENCY BROADCAST
                </div>
                <PhonePreview
                  translations={sentAlert.translations}
                  tier={sentAlert.tier as any}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setSubmittedResult(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: colors.washiCard,
                  color: colors.ink,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                  cursor: "pointer",
                }}
              >
                SUBMIT ANOTHER
              </button>

              <Link
                href="/command"
                style={{
                  flex: 1,
                  padding: "12px",
                  background: colors.vermilion,
                  color: colors.washi,
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  textDecoration: "none",
                  fontWeight: 700,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                  letterSpacing: "0.06em",
                }}
              >
                VIEW LIVE MAP →
              </Link>
            </div>
          </div>
        ) : (
          /* Report Form */
          <form
            onSubmit={handleSubmit}
            style={{
              background: colors.washiCard,
              border: `3px solid ${colors.ink}`,
              boxShadow: `5px 5px 0 ${colors.ink}`,
              padding: "var(--space-3)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {/* GPS Location Pill */}
            <div
              style={{
                background: colors.washi,
                padding: "10px 14px",
                border: `2px solid ${colors.ink}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: colors.surface,
                    color: colors.washi,
                    padding: "2px 6px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                  }}
                >
                  GPS
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Telemetry Fix:</span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", color: colors.surface, fontWeight: 700 }}>
                {locationLabel}
              </span>
            </div>

            {/* Depth Selector Chips */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                ESTIMATED WATER ACCUMULATION DEPTH
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { key: "ankle", label: "ANKLE", sub: "~15 cm", col: colors.ochre, textCol: colors.ink },
                  { key: "knee", label: "KNEE", sub: "~45 cm", col: colors.vermilion, textCol: colors.washi },
                  { key: "waist+", label: "WAIST+", sub: "1m+ Danger", col: colors.surface, textCol: colors.washi },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setDepth(item.key as any)}
                    style={{
                      padding: "12px 6px",
                      background: depth === item.key ? item.col : colors.washi,
                      color: depth === item.key ? item.textCol : colors.ink,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: depth === item.key ? `3px 3px 0 ${colors.ink}` : `1px 1px 0 ${colors.ink}`,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700 }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", opacity: 0.85 }}>
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                SITUATION DISPATCH OBSERVATION
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                required
                placeholder="Describe current road conditions, trapped people, or overflowing drains..."
                style={{
                  width: "100%",
                  background: colors.washi,
                  border: `2px solid ${colors.ink}`,
                  color: colors.ink,
                  padding: "10px 12px",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                }}
              />
            </div>

            {/* Photo Attachment Toggle */}
            <div
              style={{
                background: colors.washi,
                padding: "12px 14px",
                border: `2px solid ${colors.ink}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700 }}>
                  ATTACH CITIZEN EVIDENCE PHOTO
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7, fontFamily: "var(--font-body)" }}>
                  Feeds Vision AI depth classification & water level verification
                </div>
              </div>
              <input
                type="checkbox"
                checked={photoSelected}
                onChange={(e) => setPhotoSelected(e.target.checked)}
                style={{ width: 22, height: 22, accentColor: colors.vermilion, cursor: "pointer" }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: colors.vermilion,
                color: colors.washi,
                fontFamily: "var(--font-display)",
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "14px",
                border: `2px solid ${colors.ink}`,
                boxShadow: `4px 4px 0 ${colors.ink}`,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                marginTop: 6,
              }}
            >
              {isSubmitting ? "TRANSMITTING TO DISPATCH..." : "SUBMIT REPORT TO GRID"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
