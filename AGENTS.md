# agents.md

Instructions for any AI coding agent / IDE assistant working in this repo. Read this file first, every session.

## Read order
1. `prd.md` (what and why)
2. `architecture.md` (how it fits together)
3. `tasks.md` (what to do now)
4. `design.md` + `design_system.md` (how it looks)
5. `memory.md` (project facts and gotchas)
6. `decisions.md` (why things are the way they are)

## The logging rule (mandatory)
**Whenever you change anything, append an entry to `decisions.md` before finishing.** Each entry states:
- **What changed** (files, behaviour, scope)
- **How it works** (2-4 plain lines)
- **Why** (and what you rejected)

Also tick the task in `tasks.md` and add new gotchas to `memory.md`. Never rewrite old decision entries; add a new one that supersedes them.

## Working rules
- Shared API contracts live in `packages/shared/` (TypeScript types) and are mirrored as Pydantic models in `apps/api/app/schemas.py`. Change both together and log it.
- Every AI output carries `confidence` and `evidence`. Never return a bare score.
- Status vocabulary is fixed: incidents are `verified | probable | unverified`; alert tiers are `watch | warning | critical`.
- Critical actions (citizen alerts, evacuation orders) require command approval. Never auto-send.
- Simulated data must use the same endpoints as real feeds. Mark simulated rows with `source = 'simulated'`.
- Fake data and public images only. Never send real personal data to an LLM.
- LLM and API keys live on the server only. Always provide a non-AI fallback (template or rule) so the demo cannot break.
- Routing: never show a route that intersects an active flood or blocked-road polygon. If none exists, return "no safe route".
- Use tokens from `design.md` and components from `design_system.md`. No new colours or fonts without a decisions entry.
- Prefer small, working steps. Do not add libraries without logging why.
- Wording: "risk assessment" and "recommended action", never "guaranteed safe".

## Definition of done (per task)
- Works end to end with the simulator
- No TypeScript or Python errors, no console errors
- Map layer or panel updates live (no refresh)
- Matches the design tokens
- `tasks.md` ticked, `decisions.md` updated, `memory.md` updated if you learned something

## Roles (suggested split)
| Role | Owns |
|---|---|
| A: Frontend + map | Next.js pages, MapLibre layers, design system |
| B: Backend + data | FastAPI, PostGIS schema, weather ingest, WebSockets |
| C: AI + routing | Risk score, verification, dedupe, OSRM routing, allocation |
| D: PPT + demo | Slides, diagrams, simulator script, rehearsal |
