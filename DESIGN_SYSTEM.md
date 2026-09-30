# design_system.md

Component rules built on the tokens in `design.md`. Build these once in `apps/web/components/` and reuse everywhere.

## Tokens in code
Put tokens in `apps/web/styles/tokens.css` as CSS variables and map them in `tailwind.config.ts` (`bg-surface`, `text-muted`, `border-border`, `sev-critical`, etc.). Components use tokens only, never raw hex. Use shadcn/ui as the base and restyle it with these tokens.

## Components

| Component | Props | Rules |
|---|---|---|
| `MapView` | `layers`, `onSelect` | MapLibre + OSM tiles. Always interactive; overlays never block it. Layer toggles in a floating control. |
| `LayerToggle` | `layers[]` | Chips: Rainfall, Risk zones, Incidents, Shelters, Teams, Routes. |
| `SeverityBadge` | `tier: watch / warning / critical` | Tint background + word + dot. Never colour alone. |
| `ConfidenceBadge` | `level: verified / probable / unverified` | Icon + word. Grey for unverified. |
| `IncidentCard` | `incident` | Severity, confidence, report count ("17 reports"), age, assigned team. Tappable. |
| `IncidentQueue` | `incidents[]` | Right panel list, sorted by priority; new items slide in and pulse once. |
| `EvidencePanel` | `evidence` | Expandable "Why": report count, photo result, rainfall, source, timestamps. |
| `RiskExplain` | `zone` | Bar breakdown of score factors (rainfall, elevation, history, exposure). |
| `ApprovalCard` | `action`, `onApprove/Edit/Reject` | Inline floating card for alerts and evacuations. Three buttons, no modal. |
| `RouteLayer` | `route`, `blocked[]` | Safe route green solid; blocked segments red dashed; label "recalculated". |
| `ResourceCard` | `resource` | Shelter: capacity bar. Team: status chip (available, assigned, en route, deployed). |
| `TimelineStrip` | `events[]` | Bottom strip of timestamped events in mono type. |
| `ReportForm` | `onSubmit` | Citizen: location, photo, note, depth chips; large targets. |
| `SimPanel` | none | Rain slider, inject reports, block road, reset. Demo mode only. |
| `ConnectionDot` | none | Live / reconnecting status of the WebSocket. |
| `EmptyState` | `title`, `hint` | Plain text. |

## States every component must handle
Default, hover, pressed, disabled, loading, error, and stale (data older than 60 s shows a "stale" tag).

## Map conventions
- Flood-risk zones: translucent fill blue (low) to red (high); outline 1px.
- Incident markers: circle sized by report count, colour by severity, ring style by confidence (solid = verified, dashed = unverified).
- Shelters: square marker; Teams: triangle marker. Distinct shapes, not just colours.

## Accessibility
- Text contrast at least 4.5:1 on dark surfaces
- Focus ring 2px in `primary`
- Touch targets at least 44px
- Severity and confidence always include a word
- Reduced-motion respected

## Content style
Sentence case. Verbs first ("Approve alert", "Reassign team"). Say "recommended action" and "risk assessment"; never "guaranteed safe".

## Naming
PascalCase files, one component per file, colocate small helpers. No runtime CSS-in-JS.
