# tasks.md

Tick a task only when it works end to end with the simulator and `decisions.md` has an entry for what you changed.
Owners: **A** frontend + map, **B** backend + data, **C** AI + routing, **D** PPT + demo, **L** lead.

## Phase 0: Setup (30 min)
- [x] L: Create monorepo; commit these docs; agree the API contracts in `packages/shared` and `schemas.py`
- [x] A: Scaffold Next.js + TS + Tailwind + shadcn/ui; add tokens from `design.md`
- [x] B: Scaffold FastAPI; provision Postgres with PostGIS; run `schema.sql`
- [ ] D: Open the organizer PPT template; create the 7-slide skeleton

## Phase 1: Map and data (A + B)
- [x] B: Seed `zones.geojson` for the demo area, shelters, teams
- [x] B: Weather ingest (`services/weather.py`) with cached fallback
- [x] A: `MapView` with MapLibre + OSM; layer toggles
- [x] A: `/command` layout: map, right queue panel, bottom timeline
- [x] B: `WS /ws/events` and a frontend subscriber

## Phase 2: Intelligence (C + B)
- [x] C: Flood-risk score with factor breakdown; `GET /risk/zones`
- [x] A: Zone colouring + `RiskExplain` panel
- [x] B/C: `POST /reports`: store, cluster (dedupe), create/update incident
- [x] C: Confidence logic; photo verification with fallback
- [x] A: Incident markers, `IncidentQueue`, `/incidents/[id]` with `EvidencePanel`

## Phase 3: Response (C + A)
- [x] C: OSRM route + polygon avoidance; `POST /routes/evacuation`; precomputed fallback
- [x] C: Blocked-road handling and route recalculation event
- [x] C: Allocation (Hungarian) for teams and shelters
- [x] A: `RouteLayer`, `/resources`, `/responder`
- [x] B/A: Alerts with `ApprovalCard` (pending -> approved -> sent)

## Phase 4: Citizen and simulator (A + D)
- [x] A: `/report` mobile form (location, photo, depth chips) and result screen
- [x] D/B: `/simulate` panel + endpoints (rain, 23 reports, block road, reset)
- [x] D: Script the 10:42 -> 10:52 scenario end to end

## Phase 5: PPT and demo (D + all)
- [ ] Slide 1: title hero visual
- [ ] Slide 2: fragmentation diagram
- [ ] Slide 3: Ingest -> Verify -> Understand -> Optimize -> Act pipeline diagram
- [ ] Slide 4: layered architecture diagram + stack line
- [ ] Slide 5: 4-quadrant infographic (impact, feasibility, risks, future)
- [ ] Slide 6: references + large wrap-up line
- [ ] Slide 7: "one incident, one decision" timeline
- [ ] Rehearse the demo three times; record a backup screen video

## Cut order if time runs out
1. Embedding-based duplicate check (keep geo + time clustering)
2. Photo verification (keep report-count confidence)
3. Merge `/incidents` into `/command`; skip `/resources` page (show resources on the map)
4. Real weather API (use recorded rainfall data)
Never cut: map with risk zones, incident verification + dedupe count, route recalculation, allocation, approval card.
