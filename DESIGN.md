---
version: "alpha"
name: "Cartazista de Supermercado"
description: "Brazilian supermarket cartazista (sign maker) style landing page. Ideal for landing pages, saas. AI-ready template."
colors:
  primary: "#FF10F0"
  secondary: "#FFFF00"
  tertiary: "#00FF00"
  neutral: "#FF6600"
  surface: "#000000"
  accent: "#0066CC"
typography:
  h1:
    fontFamily: Impact
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Impact
    fontSize: 1rem
    fontWeight: 400
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: 12px
---

## Overview

Brazilian supermarket cartazista (sign maker) style landing page. Ideal for landing pages, saas. AI-ready template. Walk into any Brazilian supermarket — not the polished chains, the real ones — and you'll find them. Cartaz after cartaz, hand-painted price signs screaming offers in fluorescent tempera on cardboard. The cartazista is the person behind them. No formal training. No grid system. Just muscle memory, a brush, and an intuitive understanding of hierarchy that most design school graduates struggle to articulate.

For decades, this was invisible labor. Background noise. Then sometime in the 2010s, Brazilian designers started paying attention. Exhibitions happened. Instagram accounts archived the work. Typographers like Crystian Cruz began documenting letterforms that had evolved entirely outside academic tradition — condensed, high-contrast, built for speed and legibility at distance. The cartazista wasn't copying type design. They'd invented their own, in parallel, optimized for a completely different set of constraints: cost, speed, and the chaos of a retail floor.

What makes cartazista work resonate now is precisely its refusal to be polished. In an era of Canva templates and corporate sanitization, these signs carry an authenticity that cannot be faked. They smell like a real place. They belong to a specific economy — popular commerce, informal markets, the Brazil that actually feeds people. That roughness isn't a bug. It's the entire point.

- Density: 5/10 — Balanced
- Variance: 7/10 — Dynamic
- Motion: 4/10 — Subtle

- **Style:** Popular, Artesanal, Colorido, Brasileiro
- **Keywords:** vernacular, supermarket, cartazista, manual, handmade, fluorescent, neon, commercial, retail, offer, price, Brazilian popular, fitas crepon, letras garrafais, pincel atômico
- **Era:** Varejo Popular Brasileiro Contemporâneo
- **Light/Dark:** ✓ Full / ✗ No

## Colors

- **Rosa Neon** (#FF10F0) — Decorative accent, highlight elements
- **Amarelo Neon** (#FFFF00) — Warning states, attention indicators
- **Verde Neon** (#00FF00) — Supporting palette color
- **Laranja** (#FF6600) — Warm accent, call-to-action secondary
- **Preto** (#000000) — Dark surface, primary background
- **Azul Fosco** (#0066CC) — Secondary accent
- **Vermelho** (#FF0000) — Error states, destructive actions
- **Roxo Neon** (#FF00FF) — Accent color, emphasis elements
- **Branco** (#FFFFFF) — Secondary surface


## Typography

- **Display / Hero:** Impact — Weight 700, tight tracking, used for headline impact
- **Accent:** Anton — Used for decorative or emphasis text
- **Body:** Impact — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Impact — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Asymmetric composition.
- **Feature sections:** Asymmetric grid with varied card sizes. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Tipografia vernacular manual, letras garrafais condensadas e arredondadas, cores fluorescentes de alto impacto, fitas de preço em destaque, layouts densos e informativos, bordas marcadas com pincel, sombras duras, elementos de 'OFERTA' e 'PREÇO' em destaque visual, texturas de papel cartaz, sobreposições de cores vibrantes

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 8px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Subtly rounded (0.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Subtly rounded (0.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure white (#FFFFFF) backgrounds — use off-white or dark surfaces
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Tipografia condensada/vernacular
- Do Cores fluorescentes (rosa
- Do amarelo
- Do verde neon)
- Do Fitas de preço em destaque
- Do Bordas grossas 4-5px
- Do Layout denso informativo
- Do Sombras duras sem blur
- Do Elementos de OFERTA/PREÇO destacados


## Use Case

Landing pages, SaaS

---

# AEGISFLOW project notes (appended; the section above is the pasted design, unchanged)

Added so the coding agent does not lose the screen list or the meaning of colours when applying this style to the flood-response app.

## Colour meaning in AEGISFLOW
- Severity: critical = Vermelho `#FF0000`, warning = Laranja `#FF6600`, watch = Amarelo Neon `#FFFF00`, safe = Verde Neon `#00FF00`. Always with a word label, never colour alone.
- Confidence: verified = Verde Neon, probable = Amarelo Neon, unverified = Branco outline (dashed).
- Water / rainfall layers and flood zones = Azul Fosco `#0066CC`.
- Rosa Neon and Roxo Neon are brand accents only (buttons, headings, highlights). Never use them for data meaning.
- Keep text on colour fills black or white with at least 4.5:1 contrast. Body text on Preto should be Branco.

## Screen templates
- `/command` Command dashboard: map centre; layer toggles (Rainfall, Risk zones, Incidents, Shelters, Teams, Routes); top bar with city, clock, rainfall intensity, alert tier; right panel incident queue; bottom event timeline; floating approval card.
- `/incidents` Incident queue: sortable list with severity, confidence, report count, age, assigned team.
- `/incidents/[id]` Incident detail: map focus, evidence panel (reports, photo result, rainfall, source), confidence badge, recommended action, Approve / Edit / Reject.
- `/resources` Shelters (capacity bar) and teams (available, assigned, en route, deployed).
- `/report` Citizen report (mobile): auto location, photo, note, depth chips (ankle / knee / waist+), result screen with nearest shelter and safe route.
- `/responder` Assignment card, safe route on map, status buttons.
- `/simulate` Demo panel: rain slider, inject 23 reports, block road, reset.

## Notes for the agent
- The map is the hero. On `/command`, panels overlay it and never replace it.
- Route lines: safe = Verde Neon solid, blocked = Vermelho dashed.
- Keep the bold poster look (thick 4-5px borders, hard shadows) on headings, badges and cards. Keep map controls and data tables plain so they stay readable.
