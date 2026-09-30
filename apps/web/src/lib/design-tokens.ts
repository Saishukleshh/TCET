/**
 * design-tokens.ts
 * Re-exports design token values as typed constants so TS code
 * and MapLibre layer styles share the same source of truth as globals.css.
 *
 * Design: Ukiyo-e Woodblock Revival
 * Palette: Washi paper, Sumi ink, Vermilion red, Prussian blue, Indigo, Ochre, Pine green.
 */

export const colors = {
  // Authentic Ukiyo-e Palette
  washi:        "#F0E3CE", // Primary warm washi paper surface
  washiCard:    "#FAF4E8", // Clean washi card overlay
  washiMuted:   "#E3D3BB", // Aged parchment tone
  ink:          "#0D0D15", // Deep sumi ink (never pure #000)
  vermilion:    "#E85D35", // Red seal / hanko stamp / critical action
  indigo:       "#2A4056", // Edo indigo / structure
  prussian:     "#003153", // Great Wave Prussian blue / flood water
  ochre:        "#CC7722", // Traditional mineral ochre / warning
  pine:         "#2D7F67", // Japanese pine / verified safe

  // Semantic surfaces
  surfaceBase:    "#F0E3CE",
  surfaceOverlay: "#FAF4E8",
  surfaceCard:    "#FFFFFF",
  surfaceDark:    "#0D0D15",
  surfaceBorder:  "#0D0D15", // Decisive woodblock ink stroke

  // Prompt specification keys
  primary:      "#F0E3CE",
  secondary:    "#0D0D15",
  tertiary:     "#E85D35",
  neutral:      "#2A4056",
  surface:      "#003153", // Prussian Blue deep surface
  accent:       "#CC7722",

  // Backward-compatibility aliases mapped to Ukiyo-e equivalents
  rosaNeon:    "#E85D35",
  amareloNeon: "#CC7722",
  verdeNeon:   "#2D7F67",
  laranja:     "#E85D35",
  preto:       "#0D0D15",
  azulFosco:   "#003153",
  vermelho:    "#E85D35",
  roxoNeon:    "#2A4056",
  branco:      "#0D0D15", // In light washi theme, text is ink
  textLight:   "#FAF4E8", // For text on dark buttons/surfaces
} as const;

/** Severity → colour mapping for MapLibre expressions and badge classes. */
export const severityColor: Record<"critical" | "warning" | "watch", string> = {
  critical: colors.vermilion,
  warning:  colors.ochre,
  watch:    colors.indigo,
};

/** Confidence → colour mapping. */
export const confidenceColor: Record<"verified" | "probable" | "unverified", string> = {
  verified:   colors.pine,
  probable:   colors.ochre,
  unverified: colors.indigo,
};

/** Route line colours for MapLibre. */
export const routeColor = {
  safe:    colors.pine,       // solid Japanese pine green
  blocked: colors.vermilion,  // dashed vermilion
  water:   colors.prussian,   // Prussian blue flood
} as const;
