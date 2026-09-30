"use client";

import { useState } from "react";
import Link from "next/link";
import { colors } from "@/lib/design-tokens";
import { submitReport } from "@/lib/api-client";

export default function ReportPage() {
  const [lat, setLat] = useState<number>(19.068);
  const [lng, setLng] = useState<number>(72.875);
  const [depth, setDepth] = useState<"ankle" | "knee" | "waist+" | null>("knee");
  const [text, setText] = useState<string>("Water rapidly accumulating near railway station subway. Vehicles stalled.");
  const [photoSelected, setPhotoSelected] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);

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
        background: "var(--surface-base)",
        color: "var(--color-branco)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "var(--space-3) var(--space-2)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span
              style={{
                fontFamily: "var(--font-accent)",
                fontSize: "1.75rem",
                color: colors.amareloNeon,
                letterSpacing: "0.06em",
              }}
            >
              AEGISFLOW
            </span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: colors.azulFosco }}>
              CITIZEN FLOOD REPORTING PORTAL
            </div>
          </div>

          <Link
            href="/command"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              color: colors.amareloNeon,
              textDecoration: "none",
              border: "1px solid var(--surface-border)",
              padding: "4px 8px",
            }}
          >
            COMMAND CENTER →
          </Link>
        </div>

        {submittedResult ? (
          /* Confirmation Result Card */
          <div
            style={{
              background: "var(--surface-overlay)",
              border: `4px solid ${colors.verdeNeon}`,
              boxShadow: "5px 5px 0 #000",
              padding: "var(--space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: colors.verdeNeon,
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.2rem",
                }}
              >
                ✓
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: colors.verdeNeon }}>
                  REPORT SUBMITTED & GEOTAGGED
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.6, fontFamily: "var(--font-mono)" }}>
                  ID: #{submittedResult.id?.slice(0, 8)} · CLUSTER #{submittedResult.cluster_id?.slice(0, 8)}
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.9rem", lineHeight: 1.45, opacity: 0.9 }}>
              Thank you for keeping your community safe. Your report has been aggregated with nearby citizen signals
              and submitted for automated AI verification and emergency dispatch.
            </p>

            {/* Nearest Safe Shelter Info */}
            <div
              style={{
                background: "var(--surface-card)",
                borderLeft: `4px solid ${colors.azulFosco}`,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: colors.azulFosco }}>
                NEAREST DESIGNATED SAFE SHELTER
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem" }}>
                Kurla Municipal School (Shelter-002)
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6, fontFamily: "var(--font-mono)" }}>
                Distance: ~400 meters · Status: OPEN · Verified Safe Walking Route
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSubmittedResult(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "var(--surface-card)",
                  color: "var(--color-branco)",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  border: "1px solid var(--surface-border)",
                  cursor: "pointer",
                }}
              >
                SUBMIT ANOTHER
              </button>

              <Link
                href="/command"
                style={{
                  flex: 1,
                  padding: "10px",
                  background: colors.amareloNeon,
                  color: "#000",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  textDecoration: "none",
                  fontWeight: 800,
                  border: "2px solid #000",
                  boxShadow: "3px 3px 0 #000",
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
              background: "var(--surface-overlay)",
              border: "3px solid #000",
              boxShadow: "5px 5px 0 #000",
              padding: "var(--space-3)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {/* GPS Location Pill */}
            <div
              style={{
                background: "var(--surface-card)",
                padding: "8px 12px",
                border: "1px solid var(--surface-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: colors.verdeNeon }}>📍</span>
                <span style={{ opacity: 0.8 }}>Current Location:</span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", color: colors.amareloNeon }}>
                {lat.toFixed(4)}°N, {lng.toFixed(4)}°E (Kurla West)
              </span>
            </div>

            {/* Depth Selector Chips */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                }}
              >
                ESTIMATED WATER DEPTH
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { key: "ankle", label: "ANKLE", sub: "~15 cm", col: colors.amareloNeon },
                  { key: "knee", label: "KNEE", sub: "~45 cm", col: colors.laranja },
                  { key: "waist+", label: "WAIST+", sub: "1m+ Danger", col: colors.vermelho },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setDepth(item.key as any)}
                    style={{
                      padding: "10px 4px",
                      background: depth === item.key ? item.col : "var(--surface-card)",
                      color: depth === item.key ? "#000" : "var(--color-branco)",
                      border: depth === item.key ? "2px solid #000" : "1px solid var(--surface-border)",
                      boxShadow: depth === item.key ? "2px 2px 0 #000" : "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 800 }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>{item.sub}</span>
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
                  letterSpacing: "0.05em",
                  marginBottom: 6,
                }}
              >
                WHAT ARE YOU OBSERVING?
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                required
                placeholder="Describe current road conditions, trapped people, or overflowing drains..."
                style={{
                  width: "100%",
                  background: "var(--surface-card)",
                  border: "1px solid var(--surface-border)",
                  color: "#fff",
                  padding: "8px 10px",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Photo Attachment Toggle */}
            <div
              style={{
                background: "var(--surface-card)",
                padding: "10px 12px",
                border: "1px solid var(--surface-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem" }}>ATTACH EVIDENCE PHOTO</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>Enables automated Vision AI depth verification</div>
              </div>
              <input
                type="checkbox"
                checked={photoSelected}
                onChange={(e) => setPhotoSelected(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: colors.rosaNeon, cursor: "pointer" }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: colors.amareloNeon,
                color: "#000",
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "12px",
                border: "2px solid #000",
                boxShadow: "4px 4px 0 #000",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                marginTop: 6,
              }}
            >
              {isSubmitting ? "TRANSMITTING TO DISPATCH..." : "SUBMIT REPORT"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
