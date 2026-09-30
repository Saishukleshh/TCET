# memory.md

Living project memory for humans and coding agents. Keep it short. Add a line whenever you learn something that would save the next person time. Decisions with reasoning go in `decisions.md`; this file holds facts and gotchas.

## Project facts
- Event: Hackconquest Hackathon, Aether 2026, TCET Mumbai, 30 Sept 2026. Two rounds: PPT (max 7 slides), then main round.
- Problem: PS 14, Intelligent Disaster Management & Urban Flood Prediction
- Product name: AEGISFLOW. Tagline: From warning to response.
- Core loop: Rain -> Risk -> Incident -> Verification -> Evacuation route -> Resource allocation
- MVP stack: Next.js + TS + Tailwind + shadcn/ui, FastAPI, PostgreSQL + PostGIS, MapLibre + OSM, OSRM, WebSockets
- Optional extras (only if they strengthen the demo): sentence embeddings, XGBoost, Firebase push, Docker
- Earlier idea PS 01 (offline telemedicine PWA) is dropped; its folder is unrelated.

## Conventions
- Incident status: `verified | probable | unverified`. Alert tier: `watch | warning | critical`.
- Every AI output includes `confidence` and `evidence`.
- Simulated rows have `source = 'simulated'`.
- Timestamps in UTC in the DB, shown in local time in the UI.
- Coordinates are `[lng, lat]` in GeoJSON and MapLibre; PostGIS `ST_MakePoint(lng, lat)`. Mixing the order is the most common bug.

## Gotchas (add more)
- Stock YOLO does not detect flooding; image verification uses a vision LLM (see D-003).
- OSRM's public demo server is rate-limited and cannot take live blocked roads; we check alternatives against polygons ourselves and keep precomputed fallback routes.
- Free LLM/weather tiers rate-limit: cache results, keep non-AI fallbacks.
- PostGIS must be enabled on the database (`create extension postgis;`).
- MapLibre needs its CSS imported and a container with an explicit height.
- WebSocket hosting on serverless (Vercel) is unreliable; host the API on Render/Railway.
- Keep the demo area small (one neighbourhood) so zones, roads and routes are fast and credible.

## Demo checklist
- [x] Zones, shelters, teams seeded
- [x] Rain slider moves at least one zone to red with a visible "why"
- [x] 23 reports inject -> 1 incident, 17 duplicates shown
- [x] Photo verification works, and fallback works when the API is off
- [x] Road block triggers a recalculated route
- [x] Alert waits for approval, then shows on the citizen page
- [ ] Backup screen recording saved

## Open questions
- Exact demo area (a Mumbai neighbourhood with known waterlogging)
- Final team size and role split
- Which weather API and limits to use (confirm before relying on it)
- shadcn CLI requires network access to ui.shadcn.com. In air-gapped environments, install Radix + CVA packages via npm and hand-write components.
- @aegisflow/shared is resolved via a tsconfig path alias pointing at packages/shared/src/index.ts — no build step needed during dev. Add ../../packages/shared/src/**/*.ts to the web app tsconfig include array.
- create-next-app requires the target directory to not be inside a symlinked path that lacks write permission. Scaffold into a subdirectory, not the OneDrive root if perms are restricted.
- Next.js 15+ dynamic route params is a Promise — use async function Page({ params }: { params: Promise<...> }) and await params.
- Tailwind v4 @import "tailwindcss" must follow any external @import url(...) font definitions in globals.css, or CSS parser errors occur.
- MapLibre GL stylesheet must be explicitly imported in root layout.tsx (import "maplibre-gl/dist/maplibre-gl.css") for map canvas controls to position correctly.
- OpenStreetMap raster tiles with raster-hue-rotate: 35, raster-saturation: -0.65, raster-contrast: 0.15 achieve an authentic warm washi paper woodblock cartography without CARTO watermarks or paid API keys.
- Ukiyo-e woodblock styling requires sumi ink #0D0D15 instead of pure black #000000, and zero-blur offset drop shadows (3px 3px 0 #0D0D15) for tactile print depth.

