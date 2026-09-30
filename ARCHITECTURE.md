# architecture.md

## 1. Overview
Five layers turn raw signals into actions: **Data -> Processing -> Intelligence -> Optimization -> Experience**.

```
Weather API   OSM / geo data   Citizen reports   Resources (sim)
      \             |                |                /
       +------------+----------------+---------------+
                        |
                 FastAPI: ingest, validate, geotag, normalize
                        |
        +---------------+----------------+
        |     AI / INTELLIGENCE          |
        | flood-risk | image verify | dedupe | severity |
        +---------------+----------------+
                        |
        +---------------+----------------+
        |     RESPONSE ENGINE            |
        | OSRM routing (+avoid polygons) | assignment | alerts |
        +---------------+----------------+
                        |
        PostgreSQL + PostGIS  <-->  WebSocket events
                        |
        Command dashboard | Responder view | Citizen page
```

## 2. Repo layout
```
hackconquest-ps14/
├─ decisions.md  prd.md  agents.md  design.md
├─ design_system.md  architecture.md  tasks.md  memory.md
├─ packages/shared/          # TS types mirrored from Pydantic schemas
├─ apps/
│  ├─ web/                   # Next.js + TS + Tailwind + shadcn/ui
│  │  ├─ app/  command/ incidents/ resources/ report/ responder/ simulate/
│  │  ├─ components/  lib/  styles/
│  └─ api/                   # FastAPI (Python)
│     └─ app/
│        ├─ main.py  schemas.py  ws.py
│        ├─ routes/   reports.py incidents.py risk.py routing.py allocate.py simulate.py
│        ├─ ai/       risk.py verify_image.py dedupe.py severity.py
│        ├─ services/ weather.py osrm.py alerts.py
│        └─ db/       schema.sql  seed.py
└─ data/  zones.geojson  shelters.json  teams.json  demo_routes.json
```

## 3. Frontend routes
| Route | Page | User |
|---|---|---|
| `/command` | Command dashboard (map, queue, timeline) | Command |
| `/incidents` | Incident queue | Command |
| `/incidents/[id]` | Incident detail + evidence + approval | Command |
| `/resources` | Shelters and teams | Command |
| `/report` | Citizen report (mobile, light) | Citizen |
| `/responder` | Assignment + safe route | Responder |
| `/simulate` | Demo control panel | Team only |

If time runs short, merge `/incidents` into `/command` (right panel already lists them): 6 pages.

## 4. Data layer
| Data | Source | Notes |
|---|---|---|
| Rainfall / forecast | Free weather API (for example Open-Meteo); IMD as reference | Poll every few minutes; cache last good reading |
| Roads, buildings | OpenStreetMap | Basemap and routing graph |
| Elevation / flood history | Public DEM values and a hand-built `zones.geojson` for the demo area | Vulnerability inputs |
| Citizen reports | Our own `/report` page + simulator | Real interface, simulated volume |
| Shelters, teams | Seeded JSON | Marked `source='simulated'` |

Confirm API availability and limits before relying on them; keep cached fallback data in `data/`.

## 5. Data model (PostGIS)
| Table | Key columns |
|---|---|
| `zones` | id, name, geom (polygon), elevation_m, vulnerability (0-1), history_score, population |
| `rain_readings` | id, geom (point), intensity_mm_h, ts, source |
| `reports` | id, geom, text, image_url, depth_hint, ts, cluster_id, verification, confidence, source |
| `incidents` | id, geom, severity (watch/warning/critical), status, confidence, report_count, evidence (jsonb), created_at, updated_at |
| `blocked_roads` | id, geom (line), reason, active, ts |
| `shelters` | id, geom, capacity, occupancy, status |
| `teams` | id, geom, type, status (available/assigned/en_route/deployed), incident_id |
| `assignments` | id, incident_id, team_id, route (geom), eta_min, approved_by |
| `alerts` | id, tier, zone_id, message, status (pending/approved/sent/rejected), approved_by |
| `events` | id, ts, kind, payload (jsonb): powers the timeline and outcome logging |

## 6. Intelligence layer
**Flood-risk score (per zone, explainable):**
`risk = 0.40*rain_norm + 0.25*low_elevation + 0.20*history + 0.15*incident_density`
Weights are a starting point. Return the factor breakdown so the UI can show "why". Start rule-based; swap in XGBoost/scikit-learn only if time allows.

**Incident verification:** combine signals into confidence.
- Photo check: vision-capable LLM returns `{shows_flooding, depth_estimate, confidence}` as JSON
- Location consistency: report inside or near a high-risk zone
- Corroboration: number of independent reports in the cluster
- Result: `verified` (strong), `probable` (some), `unverified` (weak)

**Duplicate detection:** PostGIS `ST_DWithin` (about 150 m) and time window (about 30 min), confirmed by text similarity. One cluster = one incident.

**Severity:** from risk, report count, verified depth, and exposed population; maps to watch / warning / critical.

## 7. Response engine
**Routing (OSRM + avoidance):** request route with `alternatives=true`; reject any that intersect active flood or blocked-road polygons (Shapely on the server); return the fastest safe route or "no safe route". Public OSRM demo server is for light use only; keep `demo_routes.json` as fallback.

**Allocation:** cost matrix = travel time + capacity fit + severity weight; solve with `scipy.optimize.linear_sum_assignment`. Shelters are matched by remaining capacity and distance.

**Alerts:** tier from severity; created as `pending`; command approves; only then is it `sent` (in the demo: shown to the citizen page).

## 8. API
| Endpoint | Purpose |
|---|---|
| `POST /reports` | Submit report (+image); runs dedupe and verification |
| `GET /incidents`, `GET /incidents/{id}` | Prioritized list and detail with evidence |
| `GET /risk/zones` | Zone scores with factor breakdown (GeoJSON) |
| `POST /routes/evacuation` | Safe route between two points |
| `POST /allocate` | Compute team/shelter assignments |
| `POST /alerts/{id}/approve` (`/reject`) | Human-in-the-loop |
| `POST /simulate/rain`, `/simulate/reports`, `/simulate/block-road`, `/simulate/reset` | Demo control |
| `WS /ws/events` | Live stream of incidents, risk, routes, alerts |

## 9. Real-time
FastAPI WebSocket broadcasts typed events (`incident.created`, `risk.updated`, `route.recalculated`, `alert.pending`). The web app subscribes once and updates map layers and panels; a dot shows connection status.

## 10. Security and safety
- Role-based access (Command, Responder, Citizen) with simple signed tokens for the demo
- API keys server-side only
- Fake data and public images only
- Human approval for critical actions
- Outcome events logged for later model improvement

## 11. Deployment
| Part | Where |
|---|---|
| Web | Vercel |
| API | Render or Railway (Docker optional) |
| DB | Managed Postgres with PostGIS enabled (for example Supabase) |

## 12. Testing checklist
- Rain slider changes zone colours and the "why" panel
- 23 injected reports become 1 incident (17 duplicates)
- Blocking a road re-draws the route without crossing flood polygons
- Photo verification failure falls back to `unverified`
- Alert stays `pending` until approved
- Dashboard updates with no refresh
