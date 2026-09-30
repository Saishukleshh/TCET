---
version: "alpha"
name: "Ukiyo-e Woodblock Revival"
description: "Ukiyo-e landing page, woodblock print style, japanese art, bold outlines, prussian blue, paper texture, traditional graphic design. Ideal for landing pages, modern websites. AI-ready template."
colors:
  primary: "#F0E3CE"
  secondary: "#0D0D15"
  tertiary: "#E85D35"
  neutral: "#2A4056"
  surface: "#003153"
  accent: "#CC7722"
typography:
  h1:
    fontFamily: Cinzel
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Cinzel
    fontSize: 1rem
    fontWeight: 400
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: 12px
---

## Overview

Ukiyo-e landing page, woodblock print style, japanese art, bold outlines, prussian blue, paper texture, traditional graphic design. Ideal for landing pages, modern websites. AI-ready template. Hokusai didn't care about realism. Neither did Hiroshige. What they cared about was essence — distilling a mountain, a wave, a bridge in rain down to its most potent visual form. Flat planes of color. Decisive outlines. Zero apology.

This is why ukiyo-e translates so cleanly to screens. The woodblock process itself enforced constraints that digital designers chase voluntarily: limited color palettes, hard edges, no gradients to hide behind. Every shape had to earn its place on the block. The Great Wave isn't just an art history footnote — it's a masterclass in visual hierarchy that still outperforms most modern compositions. One focal point. Layered depth through overlap, not shadow. Color doing structural work.

When Art Nouveau hit Europe, it was ukiyo-e they were stealing from. When flat design emerged in 2012, it was rediscovering principles that Edo-period printmakers solved centuries earlier. The revival isn't nostalgia. It's recognition that these constraints produce clarity — and clarity is what interfaces desperately need.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 4/10 — Subtle

- **Style:** Historical, Dramatic, Bold
- **Keywords:** ukiyo-e, woodblock, japanese, great wave, bold, outlines, vintage, texture
- **Era:** Edo Period
- **Light/Dark:** ✓ Full / ✗ No

## Colors

- **Background (Washi Paper)** (#F0E3CE) — Primary warm background surface
- **Text / Ink** (#0D0D15) — Primary text color, deep sumi ink (never pure #000000)
- **Vermilion Accent** (#E85D35) — Primary accent, stamp marks, critical alerts, CTAs
- **Indigo** (#2A4056) — Accent color, secondary borders, emphasis elements
- **Prussian Blue** (#003153) — Surface accent, water representation, high-depth zones
- **Ochre** (#CC7722) — Extended palette, warning indicators, decorative badges
- **Pine / Celadon** (#2D7F67) — Safe status, approved state, verified routes

### AEGISFLOW Semantic Colour Mapping

| Token | Hex | Meaning |
|---|---|---|
| `critical` | `#E85D35` | Severe waterlogging, life risk (Vermilion red stamp) |
| `warning` | `#CC7722` | Rising water, prepare evacuation (Ochre) |
| `watch` | `#2A4056` | Advisory, monitoring (Deep Indigo) |
| `safe` | `#2D7F67` | Safe shelter, clear evacuation route (Pine Green) |
| `water / flood` | `#003153` | Water / rainfall intensity (Prussian Blue) |
| `surface-base` | `#F0E3CE` | Washi paper light/warm base |
| `surface-panel` | `#FAF4E8` | Clean washi card surface |
| `surface-dark` | `#0D0D15` | Ink black contrast surface |
| `border-ink` | `#0D0D15` | Decisive 2px-3px woodblock brush line |

## Typography

- **Display / Hero:** Cinzel — Weight 700, tight tracking, used for headline impact
- **Body:** Cinzel — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Cinzel — 0.875rem, weight 600, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, telemetry metadata, timestamps, and coordinates

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem

## Layout & Composition

- **Grid:** CSS Grid primary. Max-width containment: 1440px centered with 1.5rem side padding.
- **Spacing rhythm:** Base unit: 0.5rem (8px).
- **Hero layout:** Split-screen / command ops layout.
- **Paneling:** Bold woodblock panel borders (`2px solid #0D0D15` or `3px solid #0D0D15`).
- **Elevations & Shadows:** No blurry glow; use crisp ink offset shadows (`3px 3px 0 #0D0D15` or `4px 4px 0 #0D0D15`).
- **Z-index Contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).

## Do's and Don'ts

- No emojis in UI — use clean typography or minimalist icons
- No pure black (#000000) — use sumi ink (#0D0D15)
- No oversaturated neon colors — use authentic Edo mineral pigments
- No gradients or blurry glows — flat planes of decisive color
- Do washi paper backgrounds and framed woodblock borders
- Do red vermilion hanko stamp accents for seals and approvals
