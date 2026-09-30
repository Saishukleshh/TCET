/**
 * design-tokens.ts
 * Re-exports design token values as typed constants so TS code
 * and MapLibre layer styles share the same source of truth as globals.css.
 *
 * Colours match design.md Cartazista palette + AEGISFLOW semantic overrides.
 */

export const colors = {
  // Brand palette
  rosaNeon:    "#FF10F0",
  amareloNeon: "#FFFF00",
  verdeNeon:   "#00FF00",
  laranja:     "#FF6600",
  preto:       "#000000",
  azulFosco:   "#0066CC",
  vermelho:    "#FF0000",
  roxoNeon:    "#FF00FF",
  branco:      "#FFFFFF",

  // Surfaces
  surfaceBase:    "#0A0A0A",
  surfaceOverlay: "#111111",
  surfaceCard:    "#1A1A1A",
  surfaceBorder:  "#2A2A2A",
} as const;

/** Severity → colour mapping for MapLibre expressions and badge classes. */
export const severityColor: Record<"critical" | "warning" | "watch", string> = {
  critical: colors.vermelho,
  warning:  colors.laranja,
  watch:    colors.amareloNeon,
};

/** Confidence → colour mapping. */
export const confidenceColor: Record<"verified" | "probable" | "unverified", string> = {
  verified:   colors.verdeNeon,
  probable:   colors.amareloNeon,
  unverified: "transparent",
};

/** Route line colours for MapLibre. */
export const routeColor = {
  safe:    colors.verdeNeon,   // solid
  blocked: colors.vermelho,    // dashed
  water:   colors.azulFosco,
} as const;
