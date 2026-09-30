# AEGISFLOW — Intelligent Disaster Management & Urban Flood Prediction

> **From warning to response. Detect earlier. Verify better. Route safer. Respond together.**

[![Built with Next.js](https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre-GL-blue?style=flat&logo=maplibre)](https://maplibre.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Hackconquest Hackathon · Aether 2026 · TCET Mumbai**  
**Problem Statement 14:** Intelligent Disaster Management & Urban Flood Prediction

---

## 📌 Problem & Purpose

Urban flooding is not merely a meteorological prediction problem—it is a critical **coordination, verification, and response failure**. During catastrophic monsoon events, emergency authorities, field units, and citizens face severe information fragmentation:

1. **Information Silos**: Rainfall readings, social feeds, citizen distress calls, and shelter capacity arrive across isolated channels.
2. **Duplicate & Unverified Noise**: 20+ citizens report the same inundated intersection simultaneously, overwhelming 911/emergency dispatchers.
3. **Deadly Route Traps**: Evacuation paths computed minutes prior become impassable as water levels breach arterial roadways.
4. **Delayed Decisions**: The friction between
 detecting an anomaly and dispatching rescue boats costs lives.

**AEGISFLOW** unifies fragmented real-time telemetry into a singular, verified operational picture—automating incident deduplication, explaining flood risk, dynamically routing around hazard boundaries, and optimizing emergency resource allocation with human-in-the-loop governance.

---

## ⚡ Core Capabilities

```
Weather API (Open-Meteo)   OpenStreetMap Geo Data   Citizen Mobile Reports   Emergency Shelters & Teams
             \                    |                      |                    /
              +-------------------+----------------------+-------------------+
                                             |
                                  FastAPI Processing Engine
                                             |
                         +-------------------+-------------------+
                         |         AI & INTELLIGENCE             |
                         | - Explainable Risk Scoring (Formula)  |
                         | - Spatio-Temporal Deduplication       |
                         | - Multi-Signal Vision Verification    |
                         +-------------------+-------------------+
                                             |
                         +-------------------+-------------------+
                         |          RESPONSE ENGINE              |
                         | - OSRM Routing + Polygon Avoidance    |
                         | - Hungarian Algorithm Unit Allocation |
                         | - Human-in-the-Loop Alert Approval    |
                         +-------------------+-------------------+
                                             |
                                 Live WebSockets Stream
                                             |
            +--------------------------------+--------------------------------+
            |                                |                                |
    Command Dashboard              Field Responder HUD             Citizen Report Portal
      (`/command`)                    (`/responder`)                    (`/report`)
```

### 1. Explainable Flood Risk Matrix (`/command`)
Unlike black-box models, AEGISFLOW explains **why** an urban zone is at risk with a transparent factor breakdown:
$$\text{Risk} = 0.40 \cdot \text{Rainfall} + 0.25 \cdot \text{LowElevation} + 0.20 \cdot \text{FloodHistory} + 0.15 \cdot \text{IncidentDensity}$$
When rainfall changes, the dashboard recalibrates the Mumbai neighbourhood vulnerability matrix in real time without refreshing.

### 2. Multi-Signal Deduplication & Verification
- **Spatio-Temporal Clustering**: Groups citizen reports submitted within **150 meters** and a **30-minute window**. 23 raw reports collapse into **1 consolidated operational incident**.
- **Multi-Signal Verification**: Combines report volume, proximity to high-risk zones, and vision-based photo analysis into a clear confidence rating (`Verified` | `Probable` | `Unverified`).
- **Guaranteed Fallback**: If vision APIs are offline, heuristic rule fallbacks ensure zero disruption.

### 3. Dynamic Evacuation Routing with Hazard Avoidance
- Leverages OSRM with Shapely spatial polygon avoidance.
- Routes are continuously verified against active flood polygons and impassable road barriers.
- When an arterial roadway is marked blocked, routes automatically recalculate along safe corridors.

### 4. Optimal Resource Allocation (Hungarian Algorithm)
- Uses `scipy.optimize.linear_sum_assignment` to solve the emergency assignment cost matrix:
$$\text{Cost} = \text{TravelTime} \times (2 - \text{SeverityWeight})$$
- Automatically matches available rescue, medical, and fire units to verified critical incidents by proximity and urgency.

### 5. Human-in-the-Loop Emergency Governance
- Critical mass alerts and evacuation notices require explicit commander authorization (`Approve & Dispatch` / `Reject`) before transmission to the citizen portal.

---

## 🖥️ Application Interfaces

| Route | User Role | Description |
|---|---|---|
| **`/command`** | Incident Commander | Live MapLibre dark map, triage queue, risk matrix "why" breakdown, approval cards, and real-time event ticker. |
| **`/simulate`** | Demo Controller / Judges | **1-Click 10:42 → 10:52 Demo Scenario Runner**, rainfall intensity slider, hazard injector, and live telemetry log. |
| **`/report`** | Citizen (Mobile) | Streamlined mobile reporting with GPS geotagging, depth chips (`Ankle`, `Knee`, `Waist+`), and nearest safe shelter direction. |
| **`/responder`** | Field Rescue Teams | Tactical HUD showing current assignment, live mission status updates, and turn-by-turn safe evacuation route. |
| **`/incidents`** | Triage Officers | Filterable queue sorted by severity, status, and AI confidence with deep evidence inspection. |
| **`/resources`** | Logistics Officers | Evacuation shelter capacity tracker & automated dispatch solver. |

---

## 🎬 The "One Incident, One Decision" Demo (10:42 → 10:52)

Test the complete end-to-end response loop directly from **`/simulate`**:

| Time | Event | System Behavior |
|---|---|---|
| **10:42** | Rainfall Anomaly | Open-Meteo / sim detects 55 mm/h cloudburst over Kurla. |
| **10:45** | Risk Matrix Update | Kurla West turns red (`>70% Critical Risk`) with factor breakdown visible. |
| **10:47** | Report Influx | 23 citizen distress reports received across the corridor. |
| **10:48** | Deduplication | 17 duplicates collapse into **1 Verified Incident** with corroborating evidence. |
| **10:49** | Road Hazard | Safety barrier deployed on LBS Marg; marked impassable. |
| **10:50** | Dynamic Rerouting | Evacuation path automatically recalculates without crossing flood boundaries. |
| **10:51** | Team Dispatch | Hungarian algorithm assigns nearest Rescue Alpha unit to the incident. |
| **10:52** | Alert Broadcast | Commander approves alert; evacuation notice published to citizens. |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS v4, MapLibre GL.
- **Backend API**: Python 3.11+, FastAPI, Pydantic v2, WebSockets, Uvicorn.
- **Routing & GIS**: OpenStreetMap, OSRM routing engine, Shapely geometric analysis.
- **Intelligence**: Scipy (Hungarian algorithm `linear_sum_assignment`), Vision AI (Gemini 2.0 Flash) with heuristic rule fallbacks.
- **Shared Types**: Strict TypeScript contracts in `packages/shared` mirrored 1:1 as Pydantic models in `apps/api/app/schemas.py`.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+ recommended) & **npm**
- **Python** (v3.11+)

### 1. Clone Repository
```bash
git clone https://github.com/Saishukleshh/TCET.git
cd TCET
```

### 2. Backend Setup (FastAPI)
```bash
cd apps/api

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload
```
API Documentation will be live at: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

### 3. Frontend Setup (Next.js)
Open a new terminal window:
```bash
cd apps/web

# Install packages
npm install

# Start Next.js on port 3000
npm run dev -- -p 3000
```
Open your browser to: **[http://localhost:3000/command](http://localhost:3000/command)**

---

## 🔑 API Key Configuration (Optional)

> **No API keys are required to run the demo!**  
> The system operates 100% offline out-of-the-box using Open-Meteo free weather, open OpenStreetMap dark tiles, local OSRM corridors, and rule-based verification heuristics.

If you wish to test live multimodal photo flood verification with Google Gemini:
1. Create `apps/api/.env`:
   ```bash
   LLM_API_KEY=your_gemini_api_key_here
   LLM_MODEL=gemini-2.0-flash
   ```
2. Restart the FastAPI server.

---

## 📂 Repository Structure

```
TCET/
├── README.md               # Product documentation & setup
├── PRD.md                  # Problem statement, requirements, & user stories
├── ARCHITECTURE.md         # 5-layer system design & data contracts
├── TASKS.md                # Development roadmap & phase tracking
├── DECISIONS.md            # Architecture Decision Records (D-001 to D-022)
├── MEMORY.md               # Technical gotchas & operational memory
├── packages/
│   └── shared/             # Shared TypeScript API models
├── apps/
│   ├── api/                # FastAPI backend service
│   │   ├── app/
│   │   │   ├── ai/         # Risk formula, dedupe, & verification logic
│   │   │   ├── db/         # Seed store & PostgreSQL schema
│   │   │   ├── routes/     # REST endpoints (reports, risk, routes, allocate)
│   │   │   └── services/   # Weather poller & OSRM routing client
│   │   └── main.py         # App entry point & WebSockets broadcaster
│   └── web/                # Next.js frontend application
│       └── src/
│           ├── app/        # /command, /simulate, /report, /responder, /incidents
│           ├── components/ # MapView, EvidencePanel, ApprovalCard, EventTimeline
│           └── lib/        # API client & design tokens
└── data/                   # Seed files (zones.geojson, shelters.json, teams.json)
```

---

## 👥 Hackathon Team

**Hackconquest 2026 · TCET Mumbai**  
- **Lead & Fullstack Architecture**: Saishuklesh Maccha
- **System**: AEGISFLOW (PS 14)
