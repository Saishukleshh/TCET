# AEGISFLOW — Intelligent Disaster Management & Urban Flood Prediction

> **From warning to response. Detect earlier. Verify better. Route safer. Respond together.**

[![Built with Next.js](https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre-GL-blue?style=flat&logo=maplibre)](https://maplibre.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://vercel.com/omkar-103s-projects/aegisflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Hackconquest Hackathon · Aether 2026 · TCET Mumbai**
**Problem Statement 14:** Intelligent Disaster Management & Urban Flood Prediction

Live Demo: https://vercel.com/omkar-103s-projects/aegisflow

---

## Problem & Purpose

Urban flooding is not merely a meteorological prediction problem—it is a critical **coordination, verification, and response failure**. During catastrophic monsoon events, emergency authorities, field units, and citizens face severe information fragmentation:

1. **Information Silos**: Rainfall readings, social feeds, citizen distress calls, and shelter capacity arrive across isolated channels.
2. **Duplicate & Unverified Noise**: 20+ citizens report the same inundated intersection simultaneously, overwhelming 911/emergency dispatchers.
3. **Deadly Route Traps**: Evacuation paths computed minutes prior become impassable as water levels breach arterial roadways.
4. **Delayed Decisions**: The friction between detecting an anomaly and dispatching rescue boats costs lives.

**AEGISFLOW** unifies fragmented real-time telemetry into a singular, verified operational picture—automating incident deduplication, explaining flood risk, dynamically routing around hazard boundaries, and optimizing emergency resource allocation with human-in-the-loop governance.

---

## Core Capabilities

### 1. Explainable Flood Risk Matrix (/command)
Unlike black-box models, AEGISFLOW explains **why** an urban zone is at risk. Risk = 0.40 x Rainfall + 0.25 x LowElevation + 0.20 x FloodHistory + 0.15 x IncidentDensity. When rainfall changes, the dashboard recalibrates the Mumbai neighbourhood vulnerability matrix in real time without refreshing.

### 2. Multi-Signal Deduplication & Verification
- **Spatio-Temporal Clustering**: Groups citizen reports submitted within 150 meters and a 30-minute window. 23 raw reports collapse into 1 consolidated operational incident.
- **Multi-Signal Verification**: Combines report volume, proximity to high-risk zones, and vision-based photo analysis into a confidence rating (Verified | Probable | Unverified).
- **Guaranteed Fallback**: If vision APIs are offline, heuristic rule fallbacks ensure zero disruption.

### 3. Dynamic Evacuation Routing with Hazard Avoidance
- Leverages OSRM with Shapely spatial polygon avoidance.
- Routes are continuously verified against active flood polygons and impassable road barriers.
- When an arterial roadway is marked blocked, routes automatically recalculate along safe corridors.

### 4. Optimal Resource Allocation (Hungarian Algorithm)
- Uses scipy.optimize.linear_sum_assignment to solve the emergency assignment cost matrix.
- Automatically matches available rescue, medical, and fire units to verified critical incidents by proximity and urgency.

### 5. Human-in-the-Loop Emergency Governance
- Critical mass alerts and evacuation notices require explicit commander authorization before transmission to the citizen portal.

### 6. AI Chat Assistant (Groq / Llama 3)
- Natural-language emergency assistant powered by Groq Llama 3.3-70B inference.
- Citizens can ask about flood status, nearest shelters, and evacuation guidance in plain English.
- Deterministic rule-based fallback ensures responses even if the LLM is unavailable.

---

## Application Interfaces

| Route | User Role | Description |
|---|---|---|
| /command | Incident Commander | Live MapLibre dark map, triage queue, risk matrix breakdown, approval cards, real-time event ticker. |
| /simulate | Demo Controller | 1-Click 10:42-10:52 Demo Scenario Runner, rainfall intensity slider, hazard injector, live telemetry log. |
| /report | Citizen (Mobile) | Mobile reporting with GPS geotagging, depth chips (Ankle, Knee, Waist+), nearest safe shelter. |
| /responder | Field Rescue Teams | Tactical HUD with current assignment, mission status updates, turn-by-turn safe evacuation route. |
| /incidents | Triage Officers | Filterable queue sorted by severity, status, AI confidence with deep evidence inspection and map. |
| /resources | Logistics Officers | Evacuation shelter capacity tracker & automated dispatch solver. |
| /citizen-portal | General Public | Flood safety dashboard, AI chat assistant, real-time alert feed accessible without login. |

---

## The Demo Scenario (10:42 to 10:52)

| Time | Event | System Behavior |
|---|---|---|
| 10:42 | Rainfall Anomaly | Open-Meteo / sim detects 55 mm/h cloudburst over Kurla. |
| 10:45 | Risk Matrix Update | Kurla West turns red (>70% Critical Risk) with factor breakdown visible. |
| 10:47 | Report Influx | 23 citizen distress reports received across the corridor. |
| 10:48 | Deduplication | 17 duplicates collapse into 1 Verified Incident with corroborating evidence. |
| 10:49 | Road Hazard | Safety barrier deployed on LBS Marg; marked impassable. |
| 10:50 | Dynamic Rerouting | Evacuation path automatically recalculates without crossing flood boundaries. |
| 10:51 | Team Dispatch | Hungarian algorithm assigns nearest Rescue Alpha unit to the incident. |
| 10:52 | Alert Broadcast | Commander approves alert; evacuation notice published to citizens. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS v4, MapLibre GL |
| Backend API | Python 3.11+, FastAPI, Pydantic v2, WebSockets, Uvicorn |
| AI / LLM | Groq API (Llama 3.3-70B), Google Gemini 2.0 Flash Vision, rule-based fallbacks |
| Routing & GIS | OpenStreetMap, OSRM routing engine, Shapely geometric analysis |
| Algorithms | Scipy linear_sum_assignment (Hungarian), spatio-temporal clustering |
| Shared Types | TypeScript contracts in packages/shared mirrored as Pydantic models |

---

## Quick Start

### Prerequisites
- Node.js v18+ and npm
- Python 3.11+

### 1. Clone
```bash
git clone https://github.com/Saishukleshh/TCET.git
cd TCET
```

### 2. Backend (FastAPI)
```bash
cd apps/api
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload
```
API docs: http://127.0.0.1:8000/docs

### 3. Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev -- -p 3000
```
Open: http://localhost:3000/command

---

## Vercel Deployment

The frontend deploys automatically from main via Vercel. The vercel.json at the repo root configures the monorepo:

```json
{
  "rootDirectory": "apps/web",
  "framework": "nextjs"
}
```

**Environment variables to set in Vercel dashboard:**
| Variable | Value |
|---|---|
| NEXT_PUBLIC_API_URL | Your FastAPI backend URL |

The backend (FastAPI) must be deployed separately (Render, Railway, or Fly.io).

---

## API Key Configuration (Optional)

No API keys required to run the demo. The system runs offline using Open-Meteo, OpenStreetMap, and rule-based heuristics.

For live AI features, create apps/api/.env:
```bash
# Google Gemini (multimodal photo flood verification)
LLM_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-2.0-flash

# Groq (AI chat assistant)
GROQ_API_KEY=your_groq_api_key_here
```

---

## Repository Structure

```
TCET/
|-- README.md
|-- vercel.json                         # Vercel monorepo config
|-- ARCHITECTURE.md
|-- DECISIONS.md                        # Architecture Decision Records (D-001 to D-030)
|-- AEGISFLOW_MASTER_PROJECT_DOCUMENTATION.md
|-- packages/
|   `-- shared/                         # Shared TypeScript API models
`-- apps/
    |-- api/                            # FastAPI backend
    |   `-- app/
    |       |-- ai/                     # Risk formula, dedupe, verification
    |       |-- db/                     # Seed store & PostgreSQL schema
    |       |-- routes/                 # REST endpoints + chat
    |       `-- services/               # Weather poller & OSRM client
    `-- web/                            # Next.js frontend
        `-- src/
            |-- app/                    # All routes
            |-- components/             # MapView, Navbar, ChatBot, EvidencePanel
            `-- lib/                    # API client & design tokens
```

---

## Team

**Hackconquest 2026 · TCET Mumbai**
- **Lead & Fullstack Architecture**: Saishuklesh Maccha
- **System**: AEGISFLOW (PS 14)
