# decisions.md

Append-only log. **Every time the IDE / coding agent changes anything** (code, schema, stack, scope, design), add an entry at the bottom using the template. Never edit old entries; add a new one that supersedes them.

## Template

```
### D-XXX · <short title> · <YYYY-MM-DD HH:mm>
- Status: active | superseded by D-YYY
- What changed: <files / behaviour / scope touched>
- How it works: <2-4 lines, plain language>
- Why: <the reason, and what was rejected>
```

---

### D-001 · Project is PS 14 (AEGISFLOW), not PS 01 · 2026-09-30
- Status: active
- What changed: Scope fixed to Hackconquest PS 14, Intelligent Disaster Management & Urban Flood Prediction. The earlier PS 01 (offline telemedicine PWA) plan is dropped.
- How it works: A flood-response platform: Rain -> Risk -> Incident -> Verification -> Evacuation route -> Resource allocation.
- Why: Real data exists (weather, maps, geography); unavailable feeds (social reports, resources, CCTV) can be simulated behind the same API; the whole loop is easy to demo end to end.

### D-002 · MVP stack kept small · 2026-09-30
- Status: active
- What changed: Stack limited to Next.js + TypeScript + Tailwind, FastAPI, PostgreSQL/PostGIS, MapLibre + OpenStreetMap, OSRM, WebSockets.
- How it works: Next.js dashboard talks to a FastAPI service that owns AI logic and spatial queries; the map renders in MapLibre.
- Why: The wish-list stack (YOLO, OR-Tools, FCM, Clerk, Docker, CI) is too big for one day. Add extras only where they strengthen the demo. Python is needed for the ML parts, so the backend is FastAPI, not Node.

### D-003 · Image verification via a multimodal LLM, not YOLO · 2026-09-30
- Status: active
- What changed: apps/api/src/ai/verify_image.py design.
- How it works: The uploaded photo goes to a vision-capable LLM with a strict prompt ("does this show street flooding? depth estimate? confidence?") and returns JSON. A template fallback returns "unverified" if the call fails.
- Why: A stock YOLO model detects objects (cars, people), not flooding; training a flood detector is out of scope. A vision LLM works out of the box. Only fake or public images are sent.

### D-004 · Duplicate detection = geo + time clustering, text similarity as a booster · 2026-09-30
- Status: active
- What changed: apps/api/src/ai/dedupe.py design.
- How it works: Reports within ~150 m and ~30 min join one cluster (PostGIS `ST_DWithin`). Text similarity (sentence embeddings, or TF-IDF fallback) confirms the match. One cluster = one incident with a report count.
- Why: Geo + time alone is fast and explainable; embeddings add robustness but are optional so the demo cannot break on model download.

### D-005 · Routing: OSRM plus polygon-avoidance check · 2026-09-30
- Status: active
- What changed: apps/api/src/routing design.
- How it works: Ask OSRM for a route with alternatives. Reject any route that intersects a current flood or blocked-road polygon (turf.js / Shapely). Pick the fastest safe one. If none, return "no safe route" and flag for command.
- Why: OSRM's public demo server cannot take live blocked roads. This gives dynamic re-routing without self-hosting a custom profile. Precomputed fallback routes are stored for the demo in case the server is slow.

### D-006 · Resource allocation via assignment algorithm · 2026-09-30
- Status: active
- What changed: apps/api/src/allocate.py design.
- How it works: Build a cost matrix (travel time, capacity, severity weight) between teams/shelters and incidents, then solve with the Hungarian method (`scipy.optimize.linear_sum_assignment`).
- Why: Gives optimal assignment in ~10 lines. OR-Tools stays a future upgrade.

### D-007 · Simulated feeds behind real interfaces · 2026-09-30
- Status: active
- What changed: /simulate page and `POST /simulate/*` endpoints.
- How it works: Real rainfall comes from a weather API; citizen reports, resources and CCTV-like signals are injected by a simulator through the same endpoints real feeds would use.
- Why: Real social/CCTV/resource feeds are not available. A scripted scenario makes the demo reliable and repeatable.

### D-008 · Human-in-the-loop for high-consequence actions · 2026-09-30
- Status: active
- What changed: Alerts and evacuations require command approval (Approve / Edit / Reject).
- How it works: The AI proposes; an authorized user confirms before citizen alerts go out.
- Why: Safer, and it answers the judges' question about AI errors.

### D-009 · Confidence and explainability on every AI output · 2026-09-30
- Status: active
- What changed: Data model and UI show Verified / Probable / Unverified and a "why" panel for risk scores.
- How it works: Each incident stores confidence and evidence (report count, image result, rainfall, source). The UI shows them.
- Why: Matches the pitch ("Risk + Evidence + Confidence + Recommended Action") and builds trust.

### D-010 · PPT capped at 7 slides · 2026-09-30
- Status: active
- What changed: docs/ppt plan in prd.md and tasks.md.
- How it works: Title, Problem, Solution, Architecture, Impact/Feasibility/Risks/Future, References + wrap-up, one "one incident, one decision" timeline slide. Visuals over paragraphs.
- Why: Organizer template limits length and asks for points, diagrams and flowcharts.

### D-011 · Dark command-center UI, mobile-friendly citizen page · 2026-09-30
- Status: active
- What changed: design.md and design_system.md.
- How it works: Dark, map-first dashboard for command and responders; light, simple mobile page for citizens.
- Why: Ops dashboards are read in dim rooms and the map is the hero; citizens need a fast one-handed report form.

### D-012 · Visual style changed to "Cartazista de Supermercado" · 2026-09-30
- Status: active (supersedes D-011)
- What changed: `design.md` replaced with the pasted Cartazista design (neon supermarket-sign style: Impact/Anton type, fluorescent palette on black, thick borders, hard shadows). An appended section keeps the AEGISFLOW screen list and colour meanings.
- How it works: Brand look uses Rosa/Roxo neon for buttons and headings. Data meaning keeps fixed colours: severity (Vermelho, Laranja, Amarelo, Verde), confidence, water (Azul Fosco). Map controls and tables stay plain for readability.
- Why: Requested by the team for a distinctive, memorable look. Risk: neon and Impact can hurt legibility on a dense ops dashboard, so contrast (4.5:1) and word labels are required. `design_system.md` still lists the old dark tokens and needs updating to match.

### D-013 · Monorepo layout scaffolded · 2026-09-30
- Status: active
- What changed: Created pps/web (Next.js 16 + TS + Tailwind v4 + shadcn/ui deps), pps/api (FastAPI skeleton), packages/shared (TS types), data/ placeholders, root package.json with npm workspaces.
- How it works: pps/web is a Next.js App Router project. pps/api is a FastAPI app with pp/main.py wiring all routers. packages/shared/src holds TS types mirrored in pps/api/app/schemas.py. The web 	sconfig.json maps @aegisflow/shared directly to packages/shared/src/index.ts via path alias so no build step is needed during development.
- Why: Matches the repo layout in rchitecture.md. Path-alias approach chosen over npm workspaces symlink because the shared package has no build output yet. Rejected: a single-package approach (would break the shared-types contract from AGENTS.md).

### D-014 · Design tokens in globals.css + design-tokens.ts · 2026-09-30
- Status: active
- What changed: pps/web/src/app/globals.css replaced with full Cartazista token set (CSS custom properties). pps/web/src/lib/design-tokens.ts exports the same values as typed TS constants for MapLibre layer expressions.
- How it works: Every colour, spacing, font, shadow, and z-index value from design.md is a `--token` in :root. Severity and confidence mappings exist in both CSS utility classes and the TS file so both CSS and MapLibre code share one source of truth.
- Why: Prevents drift between map layer colours and UI badge colours. Dual-file approach chosen because MapLibre style expressions consume raw hex strings, not CSS vars.

### D-015 · shadcn/ui installed manually, no CLI registry fetch · 2026-09-30
- Status: active
- What changed: pps/web/components.json created by the partial shadcn init. Radix UI primitives, clsx, tailwind-merge, class-variance-authority, lucide-react installed via npm install. Components will be added manually from source as needed in Phase 1+.
- Why: shadcn init --defaults failed on getaddrinfo ENOTFOUND ui.shadcn.com — machine has no access to the shadcn registry at hackathon. The underlying npm packages all resolve from npmjs.org which is reachable.

### D-016 · API schemas.py mirrors packages/shared types exactly · 2026-09-30
- Status: active
- What changed: pps/api/app/schemas.py defines Pydantic v2 models for every shared type. Literal types enforce fixed vocabulary (verified/probable/unverified, watch/warning/critical). Route stubs use these schemas for response_model. pp/db/schema.sql encodes the same vocabulary as CHECK constraints.
- Why: Single source of truth for the API contract per AGENTS.md. DB-level CHECK constraints add a third enforcement layer so no invalid status strings can be persisted.

### D-017 · Multi-layer MapView with Carto dark basemap & dynamic risk layers · 2026-09-30
- Status: active
- What changed: `apps/web/src/components/MapView.tsx` and `/command` dashboard assembled with layers for zones, incidents, shelters, teams, blocked roads, and evacuation route.
- How it works: MapLibre GL instance renders raster dark tiles with custom GeoJSON sources. Zone polygons are dynamically shaded according to `risk` score interpolating from Verde Neon to Vermelho. Incidents pulse according to severity and report counts. Interactive click handlers link directly into the `RiskExplain` and `EvidencePanel` sidebars.
- Why: Provides the single operational picture required by PRD R1-R3. Dark basemap ensures fluorescent Cartazista brand colors stand out with high contrast.

### D-018 · Multi-signal incident deduplication & AI verification · 2026-09-30
- Status: active
- What changed: Ingested citizen reports in `apps/api/app/routes/reports.py` run through `app/ai/dedupe.py` and `app/ai/severity.py`. `apps/web/src/components/EvidencePanel.tsx` visualizes the multi-signal breakdown.
- How it works: Reports within 150m and a 30-min window are assigned the same `cluster_id`. 17 clustered reports consolidate into 1 incident. Vision LLM checks photo evidence with automatic heuristic fallback when offline. Confidence score and severity tiers (watch/warning/critical) are computed and broadcast live over WebSockets.
- Why: Solves the citizen report flooding problem without risking silent failures if an external LLM API is unreachable.

### D-019 · Dynamic polygon avoidance routing & Hungarian resource allocation · 2026-09-30
- Status: active
- What changed: Implemented OSRM routing with Shapely polygon avoidance in `apps/api/app/services/osrm.py` and Hungarian algorithm matching in `apps/api/app/routes/allocate.py`. Added `/resources` and `/responder` frontend views.
- How it works: Routes are verified not to intersect active flood zones or blocked road segments, returning "no safe route" or the safest corridor. `scipy.optimize.linear_sum_assignment` minimizes travel time and severity penalty to allocate emergency teams to verified incidents.
- Why: Ensures rescue units and citizens are never guided into impassable waterlogged streets, fulfilling PRD R6 and R7.

### D-020 · Human-in-the-loop alert approval & end-to-end demo simulator runner · 2026-09-30
- Status: active
- What changed: Created `ApprovalCard.tsx` in `/command`, mobile citizen portal `/report`, and full simulator panel `/simulate` with automated 10:42 → 10:52 scenario execution.
- How it works: Critical broadcasts remain `pending` until an authorized commander clicks "Approve & Send Alert". The simulator panel enables judge demonstrations: one click automates the complete 8-step incident-to-response loop with live telemetry logging.
- Why: Satisfies human-in-the-loop requirement R10 and guarantees a foolproof, rehearsable demo for hackathon judging.

### D-021 · Production runtime CSS imports and live server verification · 2026-09-30
- Status: active
- What changed: Moved external font `@import url(...)` to the top of `globals.css` ahead of `@import "tailwindcss"`. Added `import "maplibre-gl/dist/maplibre-gl.css"` to `layout.tsx`. Created `apps/web/.env.local`.
- How it works: Adheres to CSS spec for font stylesheet rules prior to Tailwind processing. Ensures MapLibre canvas controls position properly.
- Why: Guarantees zero 500 compilation errors in Next.js Turbopack runtime and full visual integrity.

### D-022 · Replaced CARTO tiles with OpenStreetMap styled raster · 2026-09-30
- Status: active
- What changed: Switched tile source in `apps/web/src/components/MapView.tsx` from `cartocdn.com` to `tile.openstreetmap.org`.
- How it works: OpenStreetMap raster tiles are adjusted directly in MapLibre with paint properties (`raster-brightness-max: 0.45`, `raster-contrast: 0.35`, `raster-saturation: -0.85`), rendering a crisp, dark operational map.
- Why: CARTO recently introduced a mandatory watermark overlay ("API KEY REQUIRED") on unauthenticated tile requests. Switching to official OpenStreetMap tiles eliminates all watermarks and requires zero API keys.



