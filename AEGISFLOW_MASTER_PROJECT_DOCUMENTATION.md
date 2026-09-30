# AEGISFLOW — Master Project Documentation
**Intelligent Disaster Management & Urban Flood Prediction Platform**  
*Hackconquest Hackathon · Aether 2026 · TCET Mumbai · Problem Statement 14*

---

> **Official Product Tagline:**  
> *"From warning to response. Detect earlier. Verify better. Route safer. Respond together."*

---

## Table of Contents

1. [Executive Summary & Presentation Pitches](#1-executive-summary--presentation-pitches)
   - [30-Second Elevator Pitch](#30-second-elevator-pitch)
   - [1-Minute Executive Summary](#1-minute-executive-summary)
   - [2-Minute Technical Pitch](#2-minute-technical-pitch)
   - [5-Minute Complete Project Walkthrough](#5-minute-complete-project-walkthrough)
2. [Problem Statement, Impact & Objectives](#2-problem-statement-impact--objectives)
   - [The Urban Flooding Crisis](#the-urban-flooding-crisis)
   - [The Five Core Breakdown Points in Traditional Response](#the-five-core-breakdown-points-in-traditional-response)
   - [Why This Problem Matters](#why-this-problem-matters)
   - [Project Objectives & Quantifiable Target Metrics](#project-objectives--quantifiable-target-metrics)
   - [Target User Personas](#target-user-personas)
3. [Complete System Architecture](#3-complete-system-architecture)
   - [5-Layer Architectural Model](#5-layer-architectural-model)
   - [System Architecture Diagram (Mermaid)](#system-architecture-diagram-mermaid)
   - [End-to-End Operational Lifecycle & Data Flow Diagram (Mermaid)](#end-to-end-operational-lifecycle--data-flow-diagram-mermaid)
   - [Monorepo Structure & Organization](#monorepo-structure--organization)
   - [Shared Type Contracts (TypeScript & Pydantic Sync)](#shared-type-contracts-typescript--pydantic-sync)
4. [User Interfaces & Application Modules](#4-user-interfaces--application-modules)
   - [Global Navigation & Responsive Header (`Navbar.tsx`)](#global-navigation--responsive-header-navbartsx)
   - [Command Center Dashboard (`/command`)](#command-center-dashboard-command)
   - [Incident Triage Queue (`/incidents`)](#incident-triage-queue-incidents)
   - [Incident Deep-Dive & Evidence Inspector (`/incidents/[id]`)](#incident-deep-dive--evidence-inspector-incidentsid)
   - [Logistics & Resource Allocation Center (`/resources`)](#logistics--resource-allocation-center-resources)
   - [Field Responder Tactical HUD (`/responder`)](#field-responder-tactical-hud-responder)
   - [Citizen Reporting Portal (`/report` & `/citizen-portal`)](#citizen-reporting-portal-report--citizen-portal)
   - [Demo Simulator & Scenario Controller (`/simulate`)](#demo-simulator--scenario-controller-simulate)
   - [AEGIS Operations AI Assistant (`ChatBot.tsx`)](#aegis-operations-ai-assistant-chatbottsx)
5. [Intelligence Layer & Mathematical Formulations](#5-intelligence-layer--mathematical-formulations)
   - [Explainable Flood Risk Scoring Matrix](#explainable-flood-risk-scoring-matrix)
   - [Spatio-Temporal Deduplication & Clustering Engine](#spatio-temporal-deduplication--clustering-engine)
   - [Multi-Signal Verification & Confidence Scoring](#multi-signal-verification--confidence-scoring)
   - [Multimodal Vision AI Verification (Llama 3.2 Vision / Gemini)](#multimodal-vision-ai-verification-llama-32-vision--gemini)
   - [AI Situation Reports (SitRep) & Tactical Briefings](#ai-situation-reports-sitrep--tactical-briefings)
   - [Bipartite Optimal Resource Allocation (Hungarian Algorithm)](#bipartite-optimal-resource-allocation-hungarian-algorithm)
   - [Multilingual Alert Synthesis (English / Hindi / Marathi)](#multilingual-alert-synthesis-english--hindi--marathi)
6. [Mapping & Routing Engine](#6-mapping--routing-engine)
   - [MapLibre GL & OpenStreetMap Cartographic Pipeline](#maplibre-gl--openstreetmap-cartographic-pipeline)
   - [Ukiyo-e Woodblock Map Styling](#ukiyo-e-woodblock-map-styling)
   - [OSRM Integration with Dynamic 2D Polygon Avoidance](#osrm-integration-with-dynamic-2d-polygon-avoidance)
   - [Fallback Precomputed Corridors](#fallback-precomputed-corridors)
7. [Database Architecture & Storage Strategy](#7-database-architecture--storage-strategy)
   - [In-Memory Production Demo Datastore (`apps/api/app/db/store.py`)](#in-memory-production-demo-datastore-appsapiappdbstorepy)
   - [PostgreSQL + PostGIS Schema Specification (`schema.sql`)](#postgresql--postgis-schema-specification-schemasql)
   - [Spatial Indices, Foreign Keys & Constraints](#spatial-indices-foreign-keys--constraints)
8. [Real-Time WebSockets Engine](#8-real-time-websockets-engine)
   - [WebSocket Broadcaster Architecture (`ws.py`)](#websocket-broadcaster-architecture-wspy)
   - [Domain Event Schema & Catalog](#domain-event-schema--catalog)
   - [Frontend Subscriber & Exponential Backoff Reconnection (`use-events.ts`)](#frontend-subscriber--exponential-backoff-reconnection-use-eventsts)
9. [Complete REST API Reference](#9-complete-rest-api-reference)
   - [Reports API (`/reports`)](#reports-api-reports)
   - [Incidents API (`/incidents`)](#incidents-api-incidents)
   - [Risk API (`/risk`)](#risk-api-risk)
   - [Routing API (`/routes`)](#routing-api-routes)
   - [Resource Allocation API (`/allocate`)](#resource-allocation-api-allocate)
   - [Alerts API (`/alerts`)](#alerts-api-alerts)
   - [Simulator API (`/simulate`)](#simulator-api-simulate)
   - [AI Chatbot API (`/chat`)](#ai-chatbot-api-chat)
   - [System Endpoints (`/health`, `/events`, `/resources/*`)](#system-endpoints-health-events-resources)
10. [Environment Configuration & Security Controls](#10-environment-configuration--security-controls)
    - [Environment Variables Directory](#environment-variables-directory)
    - [Security Architecture & Defensive Hardening](#security-architecture--defensive-hardening)
    - [Human-in-the-Loop Governance Guardrails](#human-in-the-loop-governance-guardrails)
11. [Technology Stack & Selection Justification](#11-technology-stack--selection-justification)
    - [Comprehensive Technology Matrix & Rationale](#comprehensive-technology-matrix--rationale)
12. [Implementation Reality Matrix](#12-implementation-reality-matrix)
    - [Fully Implemented vs. Partially Implemented vs. Documented-Only Features](#fully-implemented-vs-partially-implemented-vs-documented-only-features)
13. [Technical Challenges & Engineering Breakthroughs](#13-technical-challenges--engineering-breakthroughs)
14. [Limitations & Future Roadmap](#14-limitations--future-roadmap)
15. [Hackathon Demonstration Chronicle (10:42 → 10:52)](#15-hackathon-demonstration-chronicle-1042--1052)
16. [Comprehensive Viva & Judge Defense Questions](#16-comprehensive-viva--judge-defense-questions)

---

## 1. Executive Summary & Presentation Pitches

### 30-Second Elevator Pitch
> *"AEGISFLOW is a real-time disaster management and urban flood response platform designed to bridge the deadly gap between detecting waterlogging and coordinating rescue. While traditional disaster tools only show rainfall forecasts, AEGISFLOW aggregates live weather feeds, crowdsourced citizen reports, and topographic vulnerability into an explainable flood-risk matrix. It automatically filters duplicate citizen distress calls, verifies flood severity using multimodal Vision AI, dynamically routes responders around inundated roads, and optimizes team dispatch using the Hungarian algorithm—all governed by strict human commander signoff."*

### 1-Minute Executive Summary
> *"During monsoon cloudbursts in cities like Mumbai, disaster response does not fail due to a lack of data—it fails due to severe information fragmentation. Emergency dispatchers receive hundreds of duplicated calls, road networks become impassable water traps, and field rescue teams are dispatched blindly without safe navigation.*  
> 
> *AEGISFLOW solves this by creating a unified operational command center. First, it ingests rainfall data and runs an explainable, four-factor vulnerability score across urban sectors. Second, when citizens submit mobile geotagged reports with photos, our spatial clustering engine collapses nearby reports into a single operational incident, while Vision AI assesses flood depth. Third, our routing engine uses OSRM and geometric polygon avoidance to calculate safe evacuation paths that actively avoid submerged roads. Fourth, rescue units are matched to critical incidents using bipartite optimization. Finally, commanders can approve multilingual emergency alerts in Hindi, Marathi, and English with a single click. AEGISFLOW turns chaotic signals into decisive, life-saving response actions."*

### 2-Minute Technical Pitch
> *"Under the hood, AEGISFLOW is engineered as a high-performance, fullstack disaster coordination platform with strict resilience guarantees.*  
> 
> *The frontend is built on Next.js 16 with Turbopack and React 19, sporting a high-contrast Ukiyo-e Woodblock Revival design system with zero emojis and zero pure blacks for optimal clarity in dim operations rooms. MapLibre GL renders an aged washi-styled OpenStreetMap raster layer displaying real-time GeoJSON risk polygons, pulsing incident markers, shelter capacities, and live rescue routes.*  
> 
> *The backend is powered by FastAPI and Python 3.11+. Spatial queries utilize Shapely for vector geometry and 2D line segment intersection tests to prevent emergency vehicles from crossing active flood zones. Resource allocation utilizes `scipy.optimize.linear_sum_assignment` to solve a bipartite cost matrix balancing travel time and incident severity. Our intelligence pipeline features sub-second LLM inference via Groq running Llama 3.3-70B for dispatch synthesis and SitRep briefings, alongside Llama 3.2-11B Vision for photo flood verification. Crucially, every single AI component is paired with a deterministic mathematical or heuristic fallback, ensuring the platform runs with 100% reliability even if external APIs or internet connectivity drop.*  
> 
> *Real-time bidirectional synchronization is achieved via a dedicated WebSocket pipeline that broadcasts domain events with automatic exponential backoff reconnection. The entire end-to-end loop can be demonstrated in real time via our built-in 10-minute simulator, executing a complete scenario from initial cloudburst to citizen alert transmission."*

### 5-Minute Complete Project Walkthrough
*(Structured for presentation rounds, PPT narration, and live system demonstration)*

1. **The Core Dilemma (Minute 0:00 – 1:00):**  
   Every monsoon, urban metropolises face localized flash flooding that brings transport, emergency services, and citizen safety to a grinding halt. In cities like Mumbai, rainfall can exceed 50 mm/h within minutes. The Municipal Corporation of Greater Mumbai (MCGM) and disaster management cells receive hundreds of distress calls simultaneously. The fundamental problem is not detecting rain—it is the operational gap between warning and response:
   - 911 dispatchers are overwhelmed by 20+ callers reporting the exact same flooded intersection.
   - Responders take routes that were clear 10 minutes ago, only to get emergency vehicles trapped in submerged subways.
   - Citizens do not know which shelter is open, nor which corridor is safe to walk through.
   - Alerts issued in English fail to reach the non-English-speaking majority of vulnerable citizens.

2. **The AEGISFLOW Paradigm (Minute 1:00 – 2:00):**  
   AEGISFLOW operates on an end-to-end response continuum: **Ingest → Verify → Understand → Optimize → Act**.
   - **Ingest**: Automated polling of meteorological stations (Open-Meteo) combined with citizen crowd-reporting.
   - **Verify**: Spatio-temporal clustering collapses raw reports into verified incidents; multimodal Vision AI evaluates submitted photos.
   - **Understand**: Explainable risk scoring shows incident commanders *why* a zone is critical (rainfall + low elevation + historical inundation + incident density).
   - **Optimize**: Bipartite graph matching (Hungarian algorithm) dispatches rescue boats and disaster teams by travel time and incident urgency; OSRM calculates routes with active hazard polygon avoidance.
   - **Act**: Human commanders authorize emergency broadcasts that automatically translate into Hindi and Marathi for immediate citizen safety.

3. **Live Architecture & Intelligence (Minute 2:00 – 3:30):**  
   AEGISFLOW is designed around an offline-first, zero-failure architectural principle. While our PostgreSQL + PostGIS schema is fully specified with spatial indexes and integrity constraints, our live runtime utilizes a thread-safe in-memory datastore seeded with authentic Mumbai geographic polygons (Kurla West, Dharavi, Sion, Chunabhatti).  
   For artificial intelligence, we integrated Groq's high-speed inference engine running Llama 3.3-70B and Llama 3.2 Vision. When an image is submitted, the model inspects water level markers against urban objects (curbs, vehicle tires, pedestrians) to estimate depth (`ankle`, `knee`, `waist+`) in under 500 milliseconds. If the API is offline, a deterministic heuristic fallback immediately engages. Furthermore, the embedded **AEGIS AI Operations Assistant** answers queries in natural language, pulling live system telemetry directly from memory to route operators across pages.

4. **The "One Incident, One Decision" Demo (Minute 3:30 – 4:30):**  
   In our `/simulate` panel, judges can execute our canonical 10:42 → 10:52 demonstration chronicle with one click:
   - *10:42*: 55 mm/h rainfall anomaly detected over Kurla.
   - *10:45*: Risk matrix turns Kurla West red (>70% Critical Risk) with factor bars updating live.
   - *10:47*: 23 citizen reports flood into the system.
   - *10:48*: Clustering merges 17 duplicate reports into 1 verified operational incident.
   - *10:49*: LBS Marg is marked impassable due to a deployed safety barrier.
   - *10:50*: Evacuation route recalculates around the barrier in real time.
   - *10:51*: Hungarian algorithm assigns the closest rescue team (Rescue Alpha).
   - *10:52*: Commander approves the emergency alert; multilingual notifications in English, Hindi, and Marathi publish to citizens.

5. **Impact & Feasibility (Minute 4:30 – 5:00):**  
   AEGISFLOW is not theoretical—it is an operable, low-bandwidth, open-standards compliant platform that runs entirely on standard web browsers and lightweight mobile devices. It reduces 911 dispatch cognitive load by up to 75% via automated deduplication, eliminates vehicle hazard trapping through geometric route validation, and bridges the language divide during life-or-death urban crises.

---

## 2. Problem Statement, Impact & Objectives

### The Urban Flooding Crisis
Urban flooding has emerged as one of the most destructive and recurring municipal catastrophes worldwide, particularly in rapidly growing coastal and riverine metropolises. Unlike rural flooding, which often develops over days across wide river basins, urban flooding is characterized by:
- **Impervious Surfaces**: Concrete roads, asphalt parking areas, and dense concrete structures prevent natural soil infiltration.
- **Topographic Depression & Inadequate Stormwater Drainage**: Low-lying neighbourhoods and outdated storm drain networks quickly become retention basins during high-intensity cloudbursts.
- **Tidal Lock & Estuary Backflow**: In coastal cities like Mumbai, high tides block drainage outlets into the Arabian Sea and Mithi River, backing water up into city centers.

### The Five Core Breakdown Points in Traditional Response
Traditional municipal emergency response during flood events collapses due to five distinct organizational and technological failure modes:

```
[Meteorological Feeds]     [Citizen Phone Calls]     [Field Radio Traffic]     [Shelter Spreadsheets]
         │                          │                          │                         │
         ▼                          ▼                          ▼                         ▼
   Isolated Silo              Isolated Silo              Isolated Silo             Isolated Silo
         │                          │                          │                         │
         └──────────────────────────┼──────────────────────────┴─────────────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ 1. INFORMATION SILOS & BLIND SPOTS   │
                 │ Authorities lack a single live map   │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ 2. DUPLICATE CITIZEN REPORT OVERLOAD │
                 │ 20+ calls for 1 flooded intersection │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ 3. UNVERIFIED TELEMETRY & NOISE      │
                 │ Fake news / outdated photos triage   │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ 4. DEADLY EVACUATION ROUTE TRAPS     │
                 │ Turn-by-turn routes lead into floods │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ 5. DELAYED RESOURCE ALLOCATION       │
                 │ Ad-hoc dispatch without optimization │
                 └──────────────────────────────────────┘
```

1. **Information Silos & Asynchronous Telemetry**: Weather forecasts arrive via radar feeds, citizen distress signals arrive via overloaded phone lines, shelter capacities are logged on manual spreadsheets, and field responders communicate over congested radio channels. No unified common operational picture exists.
2. **Duplicate Noise & Dispatch Paralysis**: When a major intersection floods, dozens of citizens report the same location simultaneously. Emergency operators spend critical minutes logging each call individually rather than coordinating rescue operations.
3. **Unverified & Misleading Telemetry**: In the heat of a disaster, social feeds and citizen reports contain outdated photos from previous years, exaggerated claims, or false alarms. Dispatching rescue boats to unverified locations depletes scarce resources.
4. **Deadly Route Traps for Evacuees and Responders**: Commercial routing applications (such as Google Maps or standard GPS) calculate paths based on normal traffic speed and distance. They do not account for submerged subways, washed-out bridges, or active flood boundaries, frequently steering evacuees directly into deadly water traps.
5. **Delayed, Sub-Optimal Resource Allocation**: Dispatching emergency units (fire, medical, boat rescue) is typically done on a first-come, first-served basis by individual phone operators, leading to units traveling long distances while closer units sit idle.

### Why This Problem Matters
- **Loss of Human Life**: Flash floods trap citizens inside vehicles, ground-floor tenements, and basements. Drowning and electrocution from submerged electrical infrastructure are primary causes of fatality.
- **First Responder Safety**: Responders lacking real-time geospatial intelligence risk losing expensive emergency vehicles to water ingress or becoming stranded themselves.
- **Economic & Critical Infrastructure Disruption**: Transportation arteries, electrical substations, and hospitals lose operational capacity if flood barriers and evacuations are not executed hours in advance.
- **Linguistic Vulnerability**: Standard disaster alerts broadcast strictly in English fail to communicate actionable evacuation guidance to low-income populations living in vulnerable settlements who speak regional languages (Hindi and Marathi in Mumbai).

### Project Objectives & Quantifiable Target Metrics
AEGISFLOW addresses Hackconquest Problem Statement 14 with concrete, quantifiable operational goals:

| Objective | Target Operational Metric | Architectural Solution |
|---|---|---|
| **Early Threat Identification** | Detect anomalous precipitation within 60 seconds | Automated polling of Open-Meteo API with rainfall normalized risk scoring |
| **Cognitive Load Reduction** | Collapse duplicate reports by ≥70% | Spatio-temporal clustering within 150m radius and 30-minute window |
| **Verification Speed** | Verify image authenticity in <1.0 second | Multimodal Groq Llama 3.2 Vision inference with depth categorization |
| **Hazard-Free Routing** | 0% route intersection with active flood zones | OSRM routing with 2D segment-polygon collision detection |
| **Optimal Dispatch** | Minimize total travel time across all active incidents | Hungarian assignment algorithm (`scipy.optimize.linear_sum_assignment`) |
| **Inclusive Communication** | 100% multilingual alert generation in <2 seconds | Automated English, Hindi, and Marathi translation via Groq Llama 3.3 |

### Target User Personas
AEGISFLOW serves four distinct user groups with dedicated, tailored interfaces:

1. **Incident Commander (City Emergency Operations Center / Disaster Management Cell)**
   - *Needs*: High-altitude situational awareness, explainable risk intelligence, alert authorization authority, and macro-level fleet dispatch.
   - *Interface*: `/command` dashboard with full MapLibre cartography, triage queues, risk decomposition bars, and approval cards.
2. **Field Responder Units (NDRF, SDRF, Fire Brigade, Swift Water Rescue)**
   - *Needs*: Minimalist tactical HUD, single-tap status updates, precise incident coordinates, and safe turn-by-turn navigation avoiding water barriers.
   - *Interface*: `/responder` tactical view optimized for vehicle-mounted rugged tablets or mobile screens.
3. **Citizens & Community Volunteers (General Public in At-Risk Sectors)**
   - *Needs*: Ultra-lightweight, zero-friction flood reporting with one-handed mobile controls, nearest shelter locations, and clear, localized safety advisories.
   - *Interface*: `/report` and `/citizen-portal` mobile-responsive reporting interface with GPS auto-detection and WhatsApp/SMS style alert previews.
4. **Evaluators, Demo Judges & System Administrators**
   - *Needs*: Rapid verification of edge cases, controllable environmental conditions (rain, blocked roads), live telemetry inspection, and end-to-end scenario reproduction.
   - *Interface*: `/simulate` demo controller and automated scenario runner.

---

## 3. Complete System Architecture

### 5-Layer Architectural Model
AEGISFLOW transforms raw, chaotic urban signals into decisive response actions through a structured, 5-layer pipeline:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. DATA LAYER                                                               │
│ Open-Meteo API · OpenStreetMap GeoJSON · Citizen GPS Telemetry · Seed Stores│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. PROCESSING LAYER (FastAPI Ingestion Engine)                              │
│ Schema Validation (Pydantic v2) · GeoJSON Coordinate Tagging · CORS & Sanit.│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. INTELLIGENCE LAYER                                                       │
│ Explainable Risk Matrix · Haversine Clustering · Multimodal Vision Analysis │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. OPTIMIZATION & RESPONSE ENGINE                                           │
│ OSRM Hazard Avoidance Routing · Hungarian Resource Dispatch · Human Signoff │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. EXPERIENCE LAYER (Real-Time Next.js 16 Web Applications)                 │
│ Command Dashboard · Tactical HUD · Citizen Portal · Multilingual Alerts     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### System Architecture Diagram (Mermaid)

```mermaid
flowchart TB
    subgraph ExternalFeeds ["External Feeds & Public Telemetry"]
        OM["Open-Meteo API\n(Rainfall mm/h)"]
        OSM["OpenStreetMap\n(Base Tiles & Geometries)"]
        CitizenUser["Citizen Mobile\n(GPS + Camera)"]
    end

    subgraph BackendCore ["FastAPI Backend (Python 3.11+)"]
        Main["app/main.py\n(ASGI Entrypoint)"]
        WeatherPoller["app/services/weather.py\n(2-min Poller + Cache)"]
        Store["app/db/store.py\n(In-Memory Seed Datastore)"]
        PostgresSQL["app/db/schema.sql\n(Production PostGIS Schema)"]
        WS["app/ws.py\n(WebSocket Broadcaster /ws/events)"]
        
        subgraph AI_Intelligence ["AI & Optimization Engine"]
            RiskCalc["app/ai/risk.py\n(Explainable 4-Factor Risk)"]
            DedupeEngine["app/ai/dedupe.py\n(Haversine 150m/30m Cluster)"]
            VisionVerify["app/ai/verify_image.py\n(Groq Llama 3.2 Vision / Gemini)"]
            SeverityClass["app/ai/severity.py\n(Multi-Signal Classifier)"]
            SitRepEngine["app/ai/sitrep.py\n(Llama 3.3 Tactical Briefing)"]
            AllocateEngine["app/routes/allocate.py\n(Hungarian Algorithm)"]
            RouteEngine["app/services/osrm.py\n(OSRM + Polygon Avoidance)"]
            TranslateService["app/services/translate.py\n(EN/HI/MR Translation)"]
            ChatService["app/routes/chat.py\n(AEGIS Assistant + Rate Limit)"]
        end
    end

    subgraph FrontendApp ["Frontend Application (Next.js 16 + React 19)"]
        GlobalLayout["app/layout.tsx\n(Navbar + ChatBot Wrapper)"]
        CommandPage["/command\n(Ops Dashboard + MapView)"]
        IncidentsPage["/incidents & /incidents/[id]\n(Triage Queue + Evidence)"]
        ResourcesPage["/resources\n(Shelter & Team Dispatch)"]
        ResponderPage["/responder\n(Tactical Field HUD)"]
        CitizenPage["/report & /citizen-portal\n(Citizen Submission & Alerts)"]
        SimulatePage["/simulate\n(10:42→10:52 Demo Controller)"]
        MapLibreInstance["components/MapView.tsx\n(Ukiyo-e Woodblock Canvas)"]
        ChatBotInstance["components/ChatBot.tsx\n(Floating Assistant)"]
    end

    %% Ingestion flows
    OM -->|Poll Precipitation| WeatherPoller
    WeatherPoller -->|Update Rainfall| Store
    CitizenUser -->|POST /reports/| Main
    
    %% Processing & Storage
    Main --> DedupeEngine
    Main --> VisionVerify
    DedupeEngine --> Store
    VisionVerify --> SeverityClass
    SeverityClass --> Store
    Store -.-> PostgresSQL
    
    %% Real-time event propagation
    Store --> WS
    WS ==>|WS /ws/events (JSON)| FrontendApp
    
    %% Optimization & Response
    CommandPage -->|POST /allocate/| AllocateEngine
    AllocateEngine --> Store
    CommandPage -->|POST /alerts/{id}/approve| TranslateService
    TranslateService --> Store
    ResponderPage -->|POST /routes/evacuation| RouteEngine
    RouteEngine --> Store
    
    %% Frontend rendering
    FrontendApp --> MapLibreInstance
    GlobalLayout --> ChatBotInstance
    ChatBotInstance -->|POST /chat/| ChatService
    ChatService --> Store
```

### End-to-End Operational Lifecycle & Data Flow Diagram (Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen / Volunteer
    participant API as FastAPI Gateway
    participant AI as Intelligence Layer
    participant Store as State Datastore
    participant WS as WebSocket Broker
    actor Commander as Incident Commander
    participant Routing as OSRM Avoidance Engine
    actor Responder as Field Rescue Unit

    Note over Citizen,Responder: PHASE 1: ANOMALY & CITIZEN SIGNAL INTAKE
    Citizen->>API: POST /reports (Lat, Lng, Photo, Depth: Knee, Text)
    API->>AI: Trigger Deduplication & Clustering (150m, 30min)
    AI->>AI: Haversine distance check against active reports
    alt Is Duplicate Cluster
        AI-->>API: Assign Existing cluster_id
    else Is New Incident
        AI-->>API: Assign New cluster_id & incident_id
    end
    API->>AI: Trigger Multimodal Vision Verification (Photo URL)
    AI->>AI: Groq Llama 3.2 Vision checks water presence & depth
    AI-->>API: Returns {shows_flooding: true, depth: 'knee', confidence: 0.88}
    API->>AI: Compute Composite Confidence & Severity Tier
    AI-->>API: Status: "verified", Severity: "critical", Confidence: 0.88
    API->>Store: Save Report & Upsert Incident record
    API->>WS: Broadcast 'incident.created' / 'incident.updated'
    WS-->>Commander: Live update on /command map & queue (no refresh)

    Note over Commander,Routing: PHASE 2: COMMAND ASSESSMENT & ROUTE COMPUTATION
    Commander->>API: Select Sector -> GET /risk/sitrep/{zone_id}
    API->>AI: Generate Tactical Situation Briefing via Llama 3.3
    AI-->>Commander: Deliver SitRep: Headline, Risk Assessment & Actions
    Commander->>API: POST /allocate (Trigger Hungarian Dispatch)
    API->>AI: Solve Bipartite Cost Matrix: Travel Time × (2 - Severity)
    AI-->>Store: Assign Team Alpha to Incident (ETA 4 min)
    API->>WS: Broadcast 'resource.assigned'
    WS-->>Responder: Tactical Alert on /responder HUD

    Note over Responder,Citizen: PHASE 3: HAZARD-SAFE ROUTING & PUBLIC ALERTING
    Responder->>Routing: POST /routes/evacuation (Start: Base, End: Incident)
    Routing->>Routing: Query OSRM candidate routes
    Routing->>Routing: 2D Line-segment intersection test vs flood/blocked roads
    Routing-->>Responder: Return Safe Corridor (Avoids submerged LBS Marg)
    
    Commander->>API: POST /alerts/{id}/approve (Commander Seal Approved)
    API->>AI: translate_alert() to Hindi & Marathi (Groq Llama 3.3)
    AI-->>Store: Store translations: {en, hi, mr}
    API->>WS: Broadcast 'alert.sent' with translations
    WS-->>Citizen: Render multilingual SMS/CAP bubble on /report screen
```

### Monorepo Structure & Organization
The AEGISFLOW repository is arranged as an npm workspaces monorepo with clean separation between client applications, server microservices, and cross-cutting data contracts:

```
c:\Users\HP\Downloads\atherrepo\TCET\
├── package.json               # Root monorepo definition (workspaces: apps/web, packages/shared)
├── package-lock.json          # Root lockfile ensuring deterministic dependency resolution
├── PRD.md                     # Product Requirements Document (Hackconquest PS 14)
├── ARCHITECTURE.md            # Architectural specification & layer breakdown
├── DESIGN.md                  # Visual identity specification (Ukiyo-e Woodblock Revival)
├── DESIGN_SYSTEM.md           # UI tokens, color definitions, and typographic scale
├── MEMORY.md                  # Project facts, conventions, and engineering gotchas
├── DECISIONS.md               # Architecture Decision Records (D-001 through D-029)
├── TASKS.md                   # Phase-by-phase implementation checklist
├── .env                       # Backend runtime credentials & service endpoints
│
├── packages/
│   └── shared/                # Shared TypeScript contracts (npm workspace package)
│       ├── package.json       # @aegisflow/shared package definition
│       ├── tsconfig.json      # TypeScript compiler configuration
│       └── src/
│           ├── index.ts       # Central export hub for all domain types
│           └── types/         # Domain models (geo, incidents, reports, risk, etc.)
│
├── apps/
│   ├── api/                   # Python FastAPI Backend Service
│   │   ├── requirements.txt   # Python dependency specifications
│   │   ├── .env               # API environment configuration
│   │   ├── .env.example       # Sanitized environment template
│   │   ├── tests/
│   │   │   └── test_logic.py  # Unit test suite covering mathematical models & logic
│   │   └── app/
│   │       ├── __init__.py    # Module initializer & dotenv auto-loader
│   │       ├── main.py        # ASGI application entrypoint & middleware configuration
│   │       ├── schemas.py     # Pydantic v2 data models (mirrors packages/shared 1:1)
│   │       ├── ws.py          # WebSocket client manager & domain broadcaster
│   │       ├── ai/            # Machine learning & algorithmic intelligence
│   │       │   ├── risk.py    # Explainable 4-factor flood-risk scoring formula
│   │       │   ├── dedupe.py  # Haversine spatio-temporal clustering engine
│   │       │   ├── verify_image.py # Multimodal vision photo flood verification
│   │       │   ├── severity.py# Composite confidence & alert tier classification
│   │       │   ├── sitrep.py  # AI operational commander briefings & citizen drafts
│   │       │   └── groq_client.py # Low-latency Groq client for Llama 3.3 / 3.2 Vision
│   │       ├── routes/        # REST route controllers
│   │       │   ├── reports.py # Citizen report submission & processing
│   │       │   ├── incidents.py # Incident triage query & detail endpoints
│   │       │   ├── risk.py    # Zone vulnerability GeoJSON & SitRep routes
│   │       │   ├── routing.py # OSRM evacuation routing endpoints
│   │       │   ├── allocate.py# Hungarian bipartite resource allocation
│   │       │   ├── alerts.py  # Two-step alert creation, approval, and dispatch
│   │       │   ├── simulate.py# Demo controller endpoints & scenario runner
│   │       │   └── chat.py    # AEGIS operations assistant endpoint with rate-limiting
│   │       ├── services/      # External integrations & support services
│   │       │   ├── weather.py # Open-Meteo precipitation background poller
│   │       │   ├── osrm.py    # OSRM HTTP client with 2D geometric polygon avoidance
│   │       │   └── translate.py# Multilingual alert translation (EN/HI/MR)
│   │       └── db/            # Data storage layer
│   │           ├── store.py   # In-memory thread-safe state store for live demo
│   │           ├── schema.sql # Production PostgreSQL + PostGIS schema specification
│   │           └── seed.py    # Database seeder utility
│   │
│   └── web/                   # Next.js 16 Frontend Application
│       ├── package.json       # Web app dependencies (React 19, MapLibre, Tailwind v4)
│       ├── tsconfig.json      # TypeScript configuration with path alias to shared package
│       ├── next.config.ts     # Next.js build configuration (Turbopack configuration)
│       ├── .env.local         # Frontend client environment variables
│       └── src/
│           ├── app/           # Next.js App Router pages
│           │   ├── layout.tsx # Root layout injecting global Navbar & ChatBot
│           │   ├── globals.css# CSS custom properties (Ukiyo-e design tokens)
│           │   ├── page.tsx   # Root page redirecting to /command
│           │   ├── command/   # Command Center dashboard page
│           │   ├── incidents/ # Incident triage queue & /incidents/[id] detail page
│           │   ├── resources/ # Shelter tracking & team dispatch page
│           │   ├── responder/ # Tactical responder HUD page
│           │   ├── report/    # Citizen reporting portal page
│           │   ├── citizen-portal/ # Alias page re-exporting report portal
│           │   └── simulate/  # 10:42→10:52 demonstration controller page
│           ├── components/    # Reusable UI component library
│           │   ├── Navbar.tsx # Global responsive navigation bar
│           │   ├── MapView.tsx# MapLibre GL Ukiyo-e cartographic canvas
│           │   ├── EvidencePanel.tsx # Multimodal incident inspection panel
│           │   ├── ApprovalCard.tsx  # Human-in-the-loop alert authorization card
│           │   ├── PhonePreview.tsx  # Multilingual SMS/CAP message preview bubble
│           │   ├── RiskExplain.tsx   # Factor decomposition & SitRep briefing card
│           │   ├── IncidentQueue.tsx # Triage list with severity & confidence badges
│           │   ├── EventTimeline.tsx # Real-time domain event log
│           │   └── ChatBot.tsx       # Floating operations assistant dialog
│           ├── hooks/
│           │   └── use-events.ts     # Resilient WebSocket hook with exponential backoff
│           └── lib/
│               ├── api-client.ts     # Typed REST API client wrappers
│               ├── design-tokens.ts  # Typed color constants for MapLibre & components
│               └── utils.ts          # Class merging and formatting utilities
│
└── data/                      # Geospatial & Operational Seed Datasets
    ├── zones.geojson          # Mumbai demo zones (Kurla, Dharavi, Sion, etc.)
    ├── shelters.json          # Emergency shelters with capacities and coordinates
    ├── teams.json             # Field rescue units with vehicle types and readiness
    ├── demo_routes.json       # Precomputed fail-safe evacuation corridors
    └── alert_templates.json   # Deterministic EN/HI/MR fallback alert templates
```

### Shared Type Contracts (TypeScript & Pydantic Sync)
Per the repository core engineering rules (`AGENTS.md`), all API contracts are defined as shared TypeScript interfaces in `packages/shared/src/types/` and mirrored 1:1 as Pydantic v2 models in `apps/api/app/schemas.py`.

Key synchronized models include:
- `GeoPoint`: Enforces strict GeoJSON coordinate format: `(lng, lat)`. Coordinate inversion is permanently prevented.
- `ReportSubmission`: Validates citizen input with latitude (-90° to 90°), longitude (-180° to 180°), length-capped text (1–2000 chars), and depth chips (`ankle`, `knee`, `waist+`).
- `Incident`: Carries composite severity (`watch`, `warning`, `critical`), verification status (`verified`, `probable`, `unverified`), numerical confidence (0.0 to 1.0), report volume, multimodal evidence structure, and recommended action.
- `ZoneRiskScore`: Contains composite risk score, individual factor breakdown (`rain_norm`, `low_elevation`, `history`, `incident_density`), precipitation in mm/h, and exposed population.
- `DomainEvent`: Typed event envelope containing unique UUID, ISO-8601 UTC timestamp, string event type, and payload object.

---

## 4. User Interfaces & Application Modules

### Global Navigation & Responsive Header (`Navbar.tsx`)
The global navigation component serves as the application-level structural frame across every viewport.
- **Visual Design**: Rendered in clean washi card tone (`#FAF4E8`) with a heavy 2.5px sumi ink border (`#0D0D15`) and a tactile 3px ink drop shadow.
- **Brand Identity**: Features the AEGISFLOW title flanked by a Japanese Torii-style emergency gate logo and a live pulsing operational heartbeat indicator.
- **Desktop Navigation Links**: Direct navigation to `COMMAND`, `INCIDENTS`, `RESOURCES`, `RESPONDER`, `CITIZEN PORTAL`, and `SIMULATOR`. Active pages are dynamically underlined with a vermilion red ink stroke (`#E85D35`).
- **Mobile Drawer**: On screens narrower than 768px, navigation collapses into a dedicated hamburger button triggering an animated slide-down menu with large touch targets. Closing occurs automatically upon route navigation or pressing the `Escape` key.

### Command Center Dashboard (`/command`)
The primary interface for municipal emergency commanders, presenting a dense, high-contrast operational picture:
- **Interactive Map Canvas (`MapView.tsx`)**: Occupies the primary viewport, displaying real-time rainfall risk heatmaps, pulsing incident clusters, shelter statuses, and rescue unit locations.
- **Layer Toggle Toolbar**: Positioned directly over the map, allowing commanders to toggle visibility of:
  1. *Risk Zones*: Color-shaded polygon layers showing hazard tiers.
  2. *Incidents*: Pulsing markers with report counts and severity colors.
  3. *Shelters*: Safe havens displaying capacity fractions.
  4. *Rescue Teams*: Vehicle icons indicating readiness status.
  5. *Blocked Roads*: Dashed vermilion lines indicating closed roads.
  6. *Evacuation Corridors*: Prussian blue safe pathways.
- **Triage Side-Queue (`IncidentQueue.tsx`)**: Lists active emergency clusters sorted by severity and recency. Clicking an incident instantly centers the map and displays the deep-dive evidence panel.
- **Risk Explainability Card (`RiskExplain.tsx`)**: Decomposes the mathematical formula driving the selected zone's vulnerability score into four distinct progress bars. Features an **AI Sector SitRep** section that calls Groq Llama 3.3 to summarize situation reports on demand.
- **Command Seal Authorization (`ApprovalCard.tsx`)**: When a zone exceeds critical thresholds, a pending alert card appears. The commander can inspect the drafted notification, review the multilingual preview, and execute a **Command Seal Approval**, transmitting the notice to citizen devices.
- **Live Event Chronicle (`EventTimeline.tsx`)**: Bottom ticker tracking all domain events broadcast across the WebSocket pipeline in chronological order with human-readable timestamps.

### Incident Triage Queue (`/incidents`)
A dedicated full-screen tabular workspace for emergency triage officers:
- **Filtering Matrix**: Filter by Severity (`All`, `Critical`, `Warning`, `Watch`) and Verification Status (`All`, `Verified`, `Probable`, `Unverified`).
- **Telemetry Breakdown**: Displays coordinates, report volume, creation time, AI confidence percentage, and recommended response action.
- **Deep-Dive Navigation**: Clicking any incident navigates to the dedicated `/incidents/[id]` route for complete multimodal evidence inspection.

### Incident Deep-Dive & Evidence Inspector (`/incidents/[id]`)
An intensive investigation view for high-consequence emergencies:
- **Split Layout**: Displays a localized MapLibre map centered on the incident alongside the comprehensive `EvidencePanel.tsx`.
- **Multimodal Evidence Breakdown**:
  - *Vision Verification Results*: Displays submitted citizen photos, Vision AI detection verdict (`Shows Flooding: Yes/No`), water depth category, and model name.
  - *Corroborating Signal Count*: Displays how many independent citizens reported within the 150m cluster.
  - *Source Provenance*: Distinguishes whether the signal originated from real citizen mobile submissions or simulated telemetry.
  - *Precipitation Reading*: Displays local rainfall intensity recorded during the report window.
- **One-Click Tactical Actions**: Commanders can directly click **Dispatch Rescue Team** (triggering Hungarian allocation) or **Issue Zone Evacuation Notice** directly from the incident inspector.

### Logistics & Resource Allocation Center (`/resources`)
Dedicated logistics and shelter management interface:
- **Evacuation Shelter Fleet Tracker**:
  - Displays real-time occupancy versus maximum capacity for every designated refuge (e.g., Dharavi Community Hall, Kurla Municipal School, Chunabhatti Sports Complex).
  - Status indicators: `Open` (green), `Full` (ochre), `Closed` (vermilion).
- **Rescue & Medical Unit Registry**:
  - Lists disaster teams (NDRF Boat Units, Mumbai Fire Brigade, Quick Response Medical Vans).
  - Operational status: `Available`, `Assigned`, `En Route`, `Deployed`.
- **Automated Bipartite Dispatch Solver**:
  - Clicking **Run Resource Optimization** calls the Hungarian algorithm endpoint (`POST /allocate/`), which computes the global minimum travel-time matrix and dispatches available teams to active incidents.

### Field Responder Tactical HUD (`/responder`)
A streamlined, high-contrast heads-up display designed for field teams operating inside rescue vehicles or amphibious craft:
- **Current Mission Header**: Displays assigned Incident ID, target coordinates, and live GPS beacon status.
- **Mission Progression Controls**: Responders progress their status with one tap:
  $$\text{Assigned} \longrightarrow \text{En Route} \longrightarrow \text{On Scene} \longrightarrow \text{Evacuating} \longrightarrow \text{Mission Complete}$$
- **Turn-by-Turn Safe Corridor**: Displays turn-by-turn navigation instructions generated by the OSRM hazard-avoidance engine (e.g., *"Turn left onto CST Road — avoid submerged subway"*).
- **Live Corridor Map**: Visualizes the calculated path in Prussian blue, showing blocked road segments in dashed vermilion to prevent hazardous navigation.

### Citizen Reporting Portal (`/report` & `/citizen-portal`)
A lightweight, mobile-first web application designed for citizens in distress:
- **Automated Geolocation Detection**: Uses the HTML5 Geolocation API (`navigator.geolocation`) to identify coordinates with high accuracy, falling back gracefully to Kurla West if permission is denied.
- **Visual Depth Chips**: Eliminates text ambiguity by providing instant selection chips:
  - 🟢 `Ankle Level` (~10–15 cm, navigable by vehicle)
  - 🟡 `Knee Level` (~40–50 cm, passenger vehicles stalled)
  - 🔴 `Waist+ Level` (~100+ cm, life-threatening, boat required)
- **Photo Evidence Attachment**: Citizens can attach a photo or utilize a sample street flood photo for instant AI verification.
- **Instant Result Screen & Multilingual Alert Preview**: Upon submission, the screen shows the computed confidence level, cluster count, and renders the latest official emergency alert broadcast in the user's preferred language (`EN`, `हिन्दी`, `मराठी`).

### Demo Simulator & Scenario Controller (`/simulate`)
The nerve center for testing, evaluation, and hackathon judging:
- **The 1-Click 10:42 → 10:52 Scenario Chronicle**: Executes the complete 8-step disaster response lifecycle automatically with paced delays and real-time narrative logging.
- **Manual Environmental Sliders**:
  - *Rainfall Slider*: Sets precipitation intensity from 0 to 120 mm/h, triggering live risk recalculations.
  - *Inject Reports Button*: Injects 23 raw citizen reports near Kurla West to demonstrate the 17-to-1 clustering ratio.
  - *Deploy Road Hazard Button*: Places a simulated road barrier on LBS Marg, triggering instant route recalculation.
  - *Optimize Resources Button*: Executes Hungarian bipartite unit assignment.
  - *Approve Pending Alerts Button*: Signs off and broadcasts all pending alerts.
  - *Reset System Button*: Reverts the entire platform back to baseline seed data.

### AEGIS Operations AI Assistant (`ChatBot.tsx`)
A persistent, context-aware artificial intelligence assistant accessible across every page:
- **Always-Available Interface**: Floating sumi-ink chat button with unread message badges that expands into a full chat panel.
- **Real-Time Context Injection**: Every request to `POST /chat/` injects a snapshot of current system telemetry (active incident counts, available rescue units, highest-risk sectors, open shelters) directly into the LLM system prompt.
- **Instant Page Routing**: Recognizes queries like *"Where can I see shelters?"* or *"Show me the map"* and provides immediate clickable Markdown links to `/command`, `/resources`, `/responder`, etc.
- **Sliding-Window Rate Limiting**: Enforces an in-memory IP rate limit of 20 requests per 60-second window to prevent API quota exhaustion, showing remaining quota in the panel header.
- **Deterministic Intent Fallback**: If Groq credentials are missing or the API times out, a keyword-matching heuristic engine answers operational questions accurately without breaking.

---

## 5. Intelligence Layer & Mathematical Formulations

### Explainable Flood Risk Scoring Matrix
Unlike opaque deep learning models, AEGISFLOW uses a mathematically transparent, explainable formula implemented in `apps/api/app/ai/risk.py`. Every zone score can be fully audited and defended during technical evaluation.

$$\text{Risk}_{\text{zone}} = w_1 \cdot R_{\text{norm}} + w_2 \cdot E_{\text{low}} + w_3 \cdot H_{\text{score}} + w_4 \cdot D_{\text{inc}}$$

Where the fixed weights are:
- $w_1 = 0.40$ (Precipitation Weight)
- $w_2 = 0.25$ (Topographic Vulnerability Weight)
- $w_3 = 0.20$ (Historical Inundation Weight)
- $w_4 = 0.15$ (Citizen Signal Density Weight)

#### Factor Formulations:
1. **Normalized Rainfall ($R_{\text{norm}}$)**:
   $$R_{\text{norm}} = \min\left(\frac{\text{Precipitation (mm/h)}}{100.0}, 1.0\right)$$
   A rainfall intensity of 100 mm/h represents an extreme cloudburst ceiling.
2. **Low Elevation Deficit ($E_{\text{low}}$)**:
   $$E_{\text{low}} = \begin{cases} 0.0 & \text{if } \text{Elevation} \ge 6.0\text{ m} \\ 1.0 - \left(\frac{\text{Elevation}}{6.0}\right) & \text{if } \text{Elevation} < 6.0\text{ m} \end{cases}$$
   Low-lying floodplains below 6 meters above sea level receive proportionally higher vulnerability scores.
3. **Historical Inundation Score ($H_{\text{score}}$)**:
   A calibrated constant between $0.0$ and $1.0$ derived from municipal flood logs (e.g., Dharavi = 0.88, Kurla West = 0.75, Matunga = 0.22).
4. **Spatially-Scoped Incident Density ($D_{\text{inc}}$)**:
   $$D_{\text{inc}} = \min\left(\frac{N_{\text{incidents in zone}}}{5.0}, 1.0\right)$$
   Calculated by executing a Shapely geometric containment test:
   $$\text{Point}(lng, lat) \in \text{Polygon}_{\text{zone}}$$
   5 or more verified incidents in a sector saturate the density factor to 1.0.

#### Risk Tier Thresholds:
$$\text{Tier} = \begin{cases} \text{CRITICAL} & \text{if } \text{Risk} \ge 0.70 \\ \text{WARNING} & \text{if } 0.45 \le \text{Risk} < 0.70 \\ \text{WATCH} & \text{if } \text{Risk} < 0.45 \end{cases}$$

### Spatio-Temporal Deduplication & Clustering Engine
Implemented in `apps/api/app/ai/dedupe.py`, the deduplication engine prevents citizen distress signal flooding from paralyzing municipal dispatchers.

```
       New Report (Lng, Lat, Timestamp)
                      │
                      ▼
        Iterate Existing Active Reports
                      │
                      ├──────────────────────────┐
                      ▼                          ▼
           Time Delta ≤ 30 Minutes?    Distance ≤ 150 Meters?
                      │                          │
                      └─────────────┬────────────┘
                                    │
                       Both Conditions Satisfied?
                                    │
                      ┌─────────────┴─────────────┐
                      ▼                           ▼
                     YES                          NO
                      │                           │
                      ▼                           ▼
             Merge into Cluster           Create New Cluster
             Increment Report Count       Generate New Incident
             Synthesize AI Summary
```

#### Mathematical Formulation:
Distance between report coordinates $(lng_1, lat_1)$ and $(lng_2, lat_2)$ is calculated using the spherical Haversine formula:

$$\Delta\phi = \text{radians}(lat_2 - lat_1), \quad \Delta\lambda = \text{radians}(lng_2 - lng_1)$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\text{radians}(lat_1))\cos(\text{radians}(lat_2))\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$d = 2 \cdot R_{\text{earth}} \cdot \arcsin\left(\sqrt{a}\right) \quad \text{where } R_{\text{earth}} = 6{,}371{,}000\text{ meters}$$

- **Spatial Radius**: $d \le 150.0\text{ meters}$
- **Temporal Window**: $|\Delta t| \le 30.0\text{ minutes}$

If both thresholds are met, the report is assigned the existing `cluster_id`. 23 raw reports submitted in Kurla West collapse into 1 verified incident, reducing cognitive overload by 95.6%.

#### Cluster Dispatch Briefing Synthesis:
When multiple reports exist in a cluster, Groq Llama 3.3-70B consolidates the text descriptions into a single 1-to-2 sentence dispatch brief:
```python
prompt = (
    f"Consolidate these {len(report_texts)} citizen flood reports into a single, decisive 1-2 sentence emergency brief. "
    "Highlight water depth, impassable roads, and trapped individuals.\n\n"
    f"Reports:\n" + "\n".join(f"- {t}" for t in report_texts[:20]) +
    '\n\nRespond with valid JSON: {"summary": "your concise briefing"}'
)
```

### Multi-Signal Verification & Confidence Scoring
Implemented in `apps/api/app/ai/severity.py`, the system calculates a composite confidence score:

$$\text{Confidence} = 0.50 \cdot C_{\text{image}} + 0.30 \cdot C_{\text{corroboration}} + 0.20 \cdot C_{\text{location}}$$

Where:
- $C_{\text{image}}$: Vision AI confidence score (0.0 to 1.0) if photo confirms flooding; 0.10 if no photo attached.
- $C_{\text{corroboration}}$:
  $$C_{\text{corroboration}} = \begin{cases} 0.30 & \text{if } N_{\text{reports}} \ge 10 \\ 0.20 & \text{if } 5 \le N_{\text{reports}} < 10 \\ 0.12 & \text{if } 2 \le N_{\text{reports}} < 5 \\ 0.04 & \text{if } N_{\text{reports}} = 1 \end{cases}$$
- $C_{\text{location}}$: $0.20$ if report coordinates fall inside an active risk zone with risk score $\ge 0.45$; otherwise $0.0$.

#### Verification Status Classification:
$$\text{Status} = \begin{cases} \text{verified} & \text{if } \text{Confidence} \ge 0.70 \\ \text{probable} & \text{if } 0.40 \le \text{Confidence} < 0.70 \\ \text{unverified} & \text{if } \text{Confidence} < 0.40 \end{cases}$$

### Multimodal Vision AI Verification (Llama 3.2 Vision / Gemini)
Why YOLO was rejected (Architecture Decision D-003): Stock YOLO models detect common everyday objects (cars, pedestrians, chairs, dogs), not hydrological street waterlogging. Training a custom flood boundary segmentation model in a 24-hour hackathon introduces huge labeling risk. Instead, AEGISFLOW utilizes multimodal vision LLMs capable of contextual zero-shot scene reasoning.

Implemented in `apps/api/app/ai/verify_image.py`:
1. **Primary Engine**: Groq Llama 3.2-11B Vision (`llama-3.2-11b-vision-preview`), delivering sub-500ms multimodal inference.
2. **Secondary Engine**: Google Gemini 2.0 Flash (`gemini-2.0-flash`).
3. **Deterministic Heuristic Fallback**: Activates if API keys are missing or network times out, ensuring zero demo failures.

#### Strict JSON Vision Prompt:
```json
{
  "shows_flooding": true,
  "depth_estimate": "knee",
  "confidence": 0.88,
  "explanation": "Muddy floodwater reaching vehicle wheel hubs and pedestrian knee height along arterial road."
}
```

### AI Situation Reports (SitRep) & Tactical Briefings
Implemented in `apps/api/app/ai/sitrep.py`, the system generates real-time executive summaries for emergency commanders via Groq Llama 3.3.
- Ingests sector name, calculated risk score, rainfall intensity, active incident cluster count, open shelters, and available rescue units.
- Enforces strict institutional terminology per `AGENTS.md`: always uses *"risk assessment"* and *"recommended action"*, never *"guaranteed safe"*.
- Returns structured JSON containing a headline, tactical assessment, and prioritized recommended actions.

### Bipartite Optimal Resource Allocation (Hungarian Algorithm)
Implemented in `apps/api/app/routes/allocate.py`, the dispatch optimizer models emergency unit allocation as a minimum-weight bipartite matching problem solved in polynomial time $O(n^3)$ via the Hungarian algorithm (`scipy.optimize.linear_sum_assignment`).

#### Mathematical Cost Matrix Formulation:
Given $M$ available rescue units and $N$ verified emergency incidents, we construct cost matrix $C \in \mathbb{R}^{M \times N}$:

$$C_{i,j} = T_{i,j} \times (2.0 - S_j)$$

Where:
- $T_{i,j}$: Estimated travel time in minutes between Team $i$ coordinates $(lng_i, lat_i)$ and Incident $j$ coordinates $(lng_j, lat_j)$ assuming an average urban emergency transit velocity of $50\text{ km/h} \approx 833.3\text{ m/min}$:
  $$T_{i,j} = \frac{\text{HaversineDistance}(i, j)}{833.3}$$
- $S_j$: Severity urgency weight of Incident $j$:
  $$S_j = \begin{cases} 1.0 & \text{if } \text{Critical} \\ 0.6 & \text{if } \text{Warning} \\ 0.3 & \text{if } \text{Watch} \end{cases}$$
  Notice that for a Critical incident, $(2.0 - 1.0) = 1.0$, whereas for a Watch incident, $(2.0 - 0.3) = 1.7$. The algorithm strongly prioritizes assigning closer teams to critical incidents.

#### Assignment Solution:
$$\min_{\pi} \sum_{i} C_{i, \pi(i)}$$
Where $\pi$ represents the optimal permutation matching teams to incidents. If Scipy is unavailable, an automated greedy nearest-team fallback executes seamlessly.

### Multilingual Alert Synthesis (English / Hindi / Marathi)
Phase 4b implementation (`apps/api/app/services/translate.py`):
Mumbai's affected population is heavily multilingual. Broadcasting alerts exclusively in English endangers non-English speaking citizens in high-risk low-lying areas.
- **Translation Engine**: Calls Groq Llama 3.3 to produce concise translations in **Hindi (हिन्दी)** and **Marathi (मराठी)**.
- **String Length Ceiling**: Enforces a strict 300-character ceiling to comply with SMS gateway and Common Alerting Protocol (CAP) constraints.
- **Fail-Safe Template Store (`data/alert_templates.json`)**: Pre-translated native Hindi and Marathi templates with variable placeholder interpolation (`{zone}`, `{avoid}`, `{shelter}`) ensure flawless rendering even without external connectivity.
- **Typography**: The UI loads Google's `Noto Sans Devanagari` font to guarantee zero missing glyphs or square box rendering errors.

---

## 6. Mapping & Routing Engine

### MapLibre GL & OpenStreetMap Cartographic Pipeline
AEGISFLOW avoids closed, proprietary mapping SDKs (such as Mapbox or Google Maps) that require paid tokens or enforce restrictive terms of service.
- **Rendering Engine**: MapLibre GL v6.11 (`maplibre-gl`), an open-source, high-performance WebGL/WebGPU vector map client.
- **Raster Tile Pipeline**: Direct ingestion of standard OpenStreetMap raster tiles (`tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Watermark Elimination (D-022)**: Replaced CARTO dark tiles—which recently enforced an unauthenticated watermark ("API KEY REQUIRED")—with raw OSM tiles styled client-side in WebGL.

### Ukiyo-e Woodblock Map Styling
In accordance with the Ukiyo-e Woodblock Revival design specification (D-023), the map canvas is styled using real-time WebGL raster paint operations:
```typescript
paint: {
  "raster-brightness-max": 0.94,
  "raster-brightness-min": 0.08,
  "raster-contrast": 0.15,
  "raster-saturation": -0.65,
  "raster-hue-rotate": 35, // Shifts cool tiles into warm washi parchment tones
}
```
Risk zones are overlaid using dynamic GeoJSON color gradients:
- Safe: Japanese Pine Green (`rgba(45, 127, 103, 0.35)`)
- Watch: Edo Indigo (`rgba(42, 64, 86, 0.40)`)
- Warning: Mineral Ochre (`rgba(204, 119, 34, 0.55)`)
- Critical: Vermilion Red (`rgba(232, 93, 53, 0.70)`)

### OSRM Integration with Dynamic 2D Polygon Avoidance
Implemented in `apps/api/app/services/osrm.py`:
Public routing engines calculate shortest paths along dry roads. During a disaster, this leads emergency vehicles directly into flooded subways.
1. The backend queries the Open Source Routing Machine (OSRM) HTTP API requesting route candidates with `alternatives=3&geometries=geojson&overview=full&steps=true`.
2. Each candidate linestring is tested against active blocked roads and flood polygons using a 2D line segment intersection algorithm.

#### 2D Line Segment Intersection Mathematics:
Given route segment $P_1(x_1, y_1) \to P_2(x_2, y_2)$ and hazard barrier segment $P_3(x_3, y_3) \to P_4(x_4, y_4)$, we calculate vector cross products:

$$\text{Cross}(O, A, B) = (A_x - O_x)(B_y - O_y) - (A_y - O_y)(B_x - O_x)$$
$$d_1 = \text{Cross}(P_3, P_4, P_1), \quad d_2 = \text{Cross}(P_3, P_4, P_2)$$
$$d_3 = \text{Cross}(P_1, P_2, P_3), \quad d_4 = \text{Cross}(P_1, P_2, P_4)$$

Segments intersect if and only if:
$$((d_1 > 0 \text{ and } d_2 < 0) \text{ or } (d_1 < 0 \text{ and } d_2 > 0)) \quad \text{AND} \quad ((d_3 > 0 \text{ and } d_4 < 0) \text{ or } (d_3 < 0 \text{ and } d_4 > 0))$$

Any route intersecting a hazard is discarded. The fastest unblocked safe route is selected. If all candidates intersect flood zones, the system safely returns `"status": "no_safe_route"` and flags the incident for command attention.

### Fallback Precomputed Corridors
If OSRM public demo servers are unreachable or rate-limited, `apps/api/app/services/osrm.py` falls back to precomputed safe corridors stored in `data/demo_routes.json`, calculating the nearest unblocked euclidean endpoint match.

---

## 7. Database Architecture & Storage Strategy

### In-Memory Production Demo Datastore (`apps/api/app/db/store.py`)
To guarantee that the hackathon demonstration cannot crash due to broken local PostgreSQL daemons, missing PostGIS extensions, or cloud database connection latency, AEGISFLOW uses an in-memory datastore:
- Initialized on server startup from static seed files (`zones.geojson`, `shelters.json`, `teams.json`, `demo_routes.json`).
- Live mutated in memory by REST route handlers using deep-copied state dictionaries.
- Thread-safe, microsecond-latency reads and writes for all operational models.
- Can be reset to pristine seed state at any moment via `POST /simulate/reset`.

### PostgreSQL + PostGIS Schema Specification (`schema.sql`)
The complete, production-grade schema is fully documented in `apps/api/app/db/schema.sql` for enterprise deployment on managed Postgres providers (such as Supabase, Neon, or AWS RDS):

```sql
-- Core PostGIS schema with GiST spatial indexing
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    elevation_m FLOAT NOT NULL DEFAULT 0,
    vulnerability FLOAT NOT NULL DEFAULT 0 CHECK (vulnerability BETWEEN 0 AND 1),
    history_score FLOAT NOT NULL DEFAULT 0 CHECK (history_score BETWEEN 0 AND 1),
    population INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX zones_geom_idx ON zones USING GIST (geom);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom GEOMETRY(Point, 4326) NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    depth_hint TEXT CHECK (depth_hint IN ('ankle', 'knee', 'waist+')),
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cluster_id UUID,
    incident_id UUID,
    verification TEXT NOT NULL DEFAULT 'unverified' CHECK (verification IN ('verified', 'probable', 'unverified')),
    confidence FLOAT NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
    source TEXT NOT NULL DEFAULT 'citizen'
);
CREATE INDEX reports_geom_idx ON reports USING GIST (geom);
CREATE INDEX reports_cluster_idx ON reports (cluster_id);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom GEOMETRY(Point, 4326) NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('watch', 'warning', 'critical')),
    status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN ('verified', 'probable', 'unverified')),
    confidence FLOAT NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
    report_count INTEGER NOT NULL DEFAULT 1,
    evidence JSONB NOT NULL DEFAULT '{}',
    recommended_action TEXT NOT NULL DEFAULT '',
    assigned_team_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX incidents_geom_idx ON incidents USING GIST (geom);
```

### Spatial Indices, Foreign Keys & Constraints
- **GiST Spatial Indexes**: Created on all `geom` columns (`zones_geom_idx`, `reports_geom_idx`, `incidents_geom_idx`, `blocked_roads_geom_idx`) to accelerate bounding-box and intersection queries.
- **Relational Integrity**: Foreign keys enforce valid references between `assignments` and `incidents`/`teams`, as well as `alerts` and `zones`.
- **CHECK Constraints**: Three-tier database validation enforces approved enum vocabulary (`verified`, `probable`, `unverified`) and bounds coordinates and confidence values.

---

## 8. Real-Time WebSockets Engine

### WebSocket Broadcaster Architecture (`ws.py`)
Real-time state synchronization is achieved without expensive database polling:
- Implemented as an ASGI WebSocket route at `/ws/events`.
- Maintains an in-memory registry of active client connections (`_subscribers: set[WebSocket]`).
- Asynchronous `broadcast(kind, payload)` function serializes domain messages and transmits them concurrently across all connected browsers. Stale or disconnected sockets are safely discarded.

### Domain Event Schema & Catalog

```typescript
interface DomainEvent {
  id: string;        // Unique UUID
  ts: string;        // ISO-8601 UTC timestamp
  kind: string;      // Typed event identifier
  payload: any;      // Serialized event data
}
```

#### Event Catalog:
| Event Identifier | Trigger Condition | Payload Contents |
|---|---|---|
| `rain.updated` | Weather poller or simulator changes precipitation | `intensity_mm_h`, `source` |
| `risk.updated` | Precipitation or incident changes recalculate zone scores | Array of updated `ZoneRiskScore` |
| `report.submitted` | Citizen or simulator submits a report | `report_id`, `cluster_id` |
| `incident.created` | New report forms a distinct cluster | Full `Incident` object with coordinates |
| `incident.updated` | Corroborating report adds to an existing cluster | Updated `Incident` with new count & evidence |
| `road.blocked` | Hazard barrier deployed on roadway | `road_id`, `geom` (LineString) |
| `route.recalculated` | Road barrier forces route update | New safe `EvacuationRoute` geometry |
| `resource.assigned` | Hungarian algorithm dispatches unit | Array of team `assignments` |
| `alert.pending` | Zone goes critical; commander approval requested | `Alert` object in `pending` state |
| `alert.approved` | Commander approves alert; triggers translation | `Alert` object in `approved` state |
| `alert.sent` | Alert transmitted to citizen portal | `Alert` object with `{en, hi, mr}` text |
| `alert.rejected` | Commander rejects proposed alert | `Alert` object in `rejected` state |
| `simulate.reset` | System state reset to initial seed values | Empty object `{}` |

### Frontend Subscriber & Exponential Backoff Reconnection (`use-events.ts`)
The custom React hook `useEvents` provides client resilience:
- Subscribes once to `/ws/events` upon component mounting.
- Maintains an exponential backoff retry interval ($1\text{s} \to 2\text{s} \to 4\text{s} \dots \text{max } 30\text{s}$) if connectivity is interrupted.
- Tracks `isMountedRef` to prevent memory leaks and zombie reconnection loops during Next.js client-side page transitions.

---

## 9. Complete REST API Reference

All REST endpoints are served by FastAPI on base URL `http://127.0.0.1:8000`. Swagger documentation is available live at `http://127.0.0.1:8000/docs`.

### Reports API (`/reports`)
- `POST /reports/`
  - *Description*: Ingests citizen report, executes deduplication, triggers vision AI, updates confidence, and creates or updates incidents.
  - *Status Code*: `201 Created`
  - *Request Body*:
    ```json
    {
      "lat": 19.0680,
      "lng": 72.8750,
      "text": "Severe waterlogging near subway, water knee-deep",
      "image_url": "https://images.unsplash.com/photo-flood.jpg",
      "depth_hint": "knee",
      "source": "citizen"
    }
    ```
  - *Response*: Full `Report` object with assigned `cluster_id`, `incident_id`, and `verification` status.

### Incidents API (`/incidents`)
- `GET /incidents`
  - *Description*: Retrieves all active incidents sorted by creation date.
  - *Response*: Array of `IncidentListItem` objects.
- `GET /incidents/{id}`
  - *Description*: Retrieves full incident details including multimodal evidence and assigned teams.
  - *Response*: Detailed `Incident` object with `evidence` dictionary.

### Risk API (`/risk`)
- `GET /risk/zones`
  - *Description*: Retrieves zone risk scores as a GeoJSON `FeatureCollection`.
  - *Response*: GeoJSON FeatureCollection containing polygons, composite scores, and factor breakdowns.
- `GET /risk/sitrep/{zone_id}`
  - *Description*: Generates an AI tactical situation briefing for the designated sector via Groq Llama 3.3.
  - *Response*:
    ```json
    {
      "zone_id": "zone-001",
      "zone_name": "Kurla West",
      "risk_level": "critical",
      "summary": "Precipitation of 55.0 mm/h combined with low elevation has produced a critical risk score...",
      "recommended_action": "Pre-position swift-water rescue teams; verify shelter ingress routes",
      "confidence": 0.94,
      "model": "Groq Llama 3.3"
    }
    ```

### Routing API (`/routes`)
- `POST /routes/evacuation`
  - *Description*: Calculates the fastest evacuation corridor avoiding active flood zones and blocked roads.
  - *Request Body*: `{"from_lat": 19.0670, "from_lng": 72.8745, "to_lat": 19.0685, "to_lng": 72.8681}`
  - *Response*:
    ```json
    {
      "status": "safe",
      "geom": {"type": "LineString", "coordinates": [[72.8745, 19.0670], "..."]},
      "distance_m": 1240.5,
      "duration_sec": 420.0,
      "warning_message": null,
      "steps": [{"instruction": "Turn left onto CST Road", "distance_m": 350.0}]
    }
    ```

### Resource Allocation API (`/allocate`)
- `POST /allocate/`
  - *Description*: Executes the Hungarian algorithm to solve the bipartite team-incident matching matrix.
  - *Request Body*: `{"incident_ids": ["uuid-1", "uuid-2"]}`
  - *Response*: `{"assignments": [{"id": "uuid", "incident_id": "...", "team_id": "...", "eta_min": 4}]}`

### Alerts API (`/alerts`)
- `GET /alerts/`
  - *Description*: Lists all alerts sorted by creation time.
- `POST /alerts/`
  - *Description*: Creates a pending alert (status: `pending`).
- `POST /alerts/{id}/approve`
  - *Description*: Commander authorizes the alert. Triggers multilingual translation into Hindi and Marathi.
- `POST /alerts/{id}/send`
  - *Description*: Broadcasts the approved alert to citizen devices.
- `POST /alerts/{id}/reject`
  - *Description*: Commander dismisses the alert proposal.

### Simulator API (`/simulate`)
- `POST /simulate/rain`: Injects simulated precipitation in mm/h.
- `POST /simulate/reports`: Injects $N$ simulated citizen reports around a zone.
- `POST /simulate/block-road`: Deploys a simulated roadblock barrier.
- `POST /simulate/reset`: Restores the in-memory store to pristine seed data.
- `GET /simulate/state`: Returns counts of active incidents, reports, teams, and shelters.

### AI Chatbot API (`/chat`)
- `POST /chat/`
  - *Description*: Queries the AEGIS assistant with conversation history and live store context injection. Enforces 20 req/min rate limit per IP.
  - *Response*: `{"reply": "...", "model_used": "groq/llama-3.3-70b-versatile", "rate_limit_remaining": 19}`

### System Endpoints
- `GET /health`: Healthcheck endpoint returning `{"status": "ok", "service": "aegisflow-api"}`.
- `GET /events`: Retrieves the last 100 domain events in reverse chronological order.
- `GET /resources/shelters`: Retrieves all emergency evacuation shelters.
- `GET /resources/teams`: Retrieves all field rescue and medical units.

---

## 10. Environment Configuration & Security Controls

### Environment Variables Directory
To prevent credential leaks and satisfy strict hackathon security criteria, all secret values remain in `.env` files and are never committed to public repositories.

| Variable Name | Component | Operational Purpose | Default / Example Value |
|---|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string for production PostGIS | `postgresql+asyncpg://user:pass@host:5432/db` |
| `LLM_API_KEY` | Backend | General multimodal LLM inference API key | *(Secret Token)* |
| `WEATHER_API_KEY` | Backend | Weather service API endpoint or authentication key | *(Open-Meteo URL)* |
| `OSRM_BASE_URL` | Backend | OSRM routing engine HTTP base URL | `https://router.project-osrm.org` |
| `OPEN_ROUTER_API_KEY` | Backend | OpenRouter API gateway key | *(Secret Token)* |
| `GROQ_API_KEY` | Backend | Primary Groq ultra-low latency inference API key | *(Secret Token)* |
| `GROQ_TEXT_MODEL` | Backend | Primary model for SitRep and dispatch synthesis | `llama-3.3-70b-versatile` |
| `GROQ_VISION_MODEL` | Backend | Primary model for multimodal photo verification | `llama-3.2-11b-vision-preview` |
| `CORS_ORIGINS` | Backend | Allowed CORS client host origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL of the FastAPI REST backend | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | Frontend | WebSocket endpoint for live domain event streaming | `ws://localhost:8000/ws/events` |

### Security Architecture & Defensive Hardening
1. **Parameterized CORS Policy (`main.py`)**: Restricts incoming browser requests to authorized local and production origins, preventing unauthorized cross-origin invocation.
2. **Server-Side Request Forgery (SSRF) Protection (`verify_image.py`)**: Validates submitted photo URLs to ensure they use public HTTP/HTTPS schemes and do not target loopback addresses (`127.0.0.1`, `localhost`), private subnets (`10.x.x.x`, `192.168.x.x`), or cloud metadata endpoints (`169.254.169.254`).
3. **Pydantic Boundary Validation (`schemas.py`)**: Strictly constrains coordinate ranges (latitude: -90° to 90°, longitude: -180° to 180°), caps string lengths (descriptions: 2000 chars), and validates literal enums to block injection attacks.
4. **Sliding-Window IP Rate Limiting (`chat.py`)**: Tracks client IP request timestamps using in-memory deques, rejecting requests beyond 20 calls/min with HTTP 429 to protect LLM inference quotas.

### Human-in-the-Loop Governance Guardrails
In high-consequence disaster scenarios, autonomous AI systems must never be permitted to broadcast evacuation orders or public panic warnings directly to citizens without human oversight.
- The AI engine generates drafted messages and classifies threat severity into `pending` states.
- The **Command Seal Required** card requires an authorized human commander to explicitly click **Approve & Send Alert**.
- Alerts can be edited or rejected with a single click.

---

## 11. Technology Stack & Selection Justification

| Technology | Category | Role in AEGISFLOW | Why Chosen | Rejected Alternatives & Trade-Offs |
|---|---|---|---|---|
| **Next.js 16 (App Router)** | Frontend Framework | Primary frontend web framework | Turbopack compilation (<1s rebuilds), server component architecture, native TypeScript support | Vite/SPA (lacks unified server-rendering and metadata optimization); Create React App (deprecated). |
| **React 19** | UI Library | UI component lifecycle and reactivity | High-speed concurrent rendering, hooks architecture, seamless integration with Next.js App Router | Vue/Angular (team velocity and ecosystem support). |
| **Tailwind CSS v4** | Styling Engine | Design token utilities and micro-styling | Native CSS variables integration, minimal stylesheet footprint, zero runtime CSS injection overhead | CSS Modules (too verbose); Tailwind v3 (older CSS parser syntax). |
| **MapLibre GL v6** | GIS / Mapping SDK | Interactive cartographic rendering | Open-source, WebGL hardware acceleration, custom raster paint filters, zero API key constraints | Mapbox GL (proprietary, paid token billing, telemetry tracking); Google Maps JS (inflexible styling, expensive). |
| **OpenStreetMap** | Spatial Basemap Data | Global street grid and raster tiles | Free, open community data, no authentication barriers, globally recognized cartography | CARTO (enforces unauthenticated watermarks); MapTiler (requires billing account). |
| **FastAPI** | Backend Framework | Core REST & WebSocket microservice | Native asynchronous ASGI support, automatic Pydantic OpenAPI documentation, microsecond latency | Django (too heavy for microservices); Node/Express (lacks native Python GIS and Scipy libraries). |
| **Pydantic v2** | Data Validation | Boundary validation and schema sync | Strict type validation, C-speed core performance, direct serialization compatibility | Marshmallow (slower); standard Python dataclasses (no automatic HTTP validation). |
| **Groq Llama 3.3-70B** | LLM Inference | SitRep briefings, dedupe synthesis, alert translation, AEGIS chat | Ultra-fast inference (<1 sec per turn), JSON mode support, exceptional reasoning capability | OpenAI GPT-4o (slower latency, higher API cost); Local Ollama (too slow for real-time hackathon demos). |
| **Groq Llama 3.2 Vision** | Multimodal Vision AI | Flood photo verification and depth estimation | Instant (<500ms) image understanding, accurate contextual water detection | Stock YOLO (detects objects, not water); fine-tuning CNN (unrealistic in 24 hours). |
| **OSRM** | Routing Engine | Road network path calculation | Open-source road routing, alternative candidate generation, turn-by-turn steps | Google Directions API (expensive, cannot inject custom polygon avoidance); pgRouting (requires heavy database graph setup). |
| **Shapely** | Computational Geometry | Vector polygon avoidance and point-in-polygon tests | High-speed C-geos implementation, exact 2D line segment intersection calculations | Turf.js on client (client-dependent, slower for large vector datasets). |
| **Scipy (`linear_sum_assignment`)** | Optimization Library | Bipartite emergency resource allocation | Exact Hungarian algorithm implementation in 5 lines, guaranteed global minimum cost solution | Google OR-Tools (excessive dependency weight); Greedy heuristics (sub-optimal assignments). |
| **WebSockets** | Real-Time Transport | Instant bidirectional event broadcasting | Native browser support, minimal packet overhead, sub-10ms event delivery across screens | Server-Sent Events (SSE) (unidirectional only); Long-polling (wasteful HTTP overhead). |
| **In-Memory Store (`store.py`)** | Datastore | Zero-dependency demo persistence | Eliminates database connection failures, zero disk I/O latency, instant reset capability | Pure PostgreSQL dependency (risks database crash during live hackathon judging). |

---

## 12. Implementation Reality Matrix

To maintain strict intellectual integrity and adhere to `AGENTS.md`, this section clearly demarcates what is fully implemented and tested in code versus features that are planned or documented for future releases:

| Feature / Module | Architectural Status | Implementation Evidence in Code | Notes & Limitations |
|---|---|---|---|
| **Explainable Risk Formula** | ✅ Fully Implemented | `apps/api/app/ai/risk.py` | 4-factor breakdown with mathematical weights. Monotonicity unit-tested. |
| **Haversine Clustering (Dedupe)** | ✅ Fully Implemented | `apps/api/app/ai/dedupe.py` | 150m and 30-min window. 23 reports collapse into 1 verified incident. |
| **Llama 3.2 Vision Verification** | ✅ Fully Implemented | `apps/api/app/ai/verify_image.py` | Groq Llama 3.2 Vision with Gemini 2.0 and heuristic fallbacks. |
| **Cluster Text Summarization** | ✅ Fully Implemented | `apps/api/app/ai/dedupe.py` | Groq Llama 3.3 synthesizes reports into concise operational brief. |
| **AI Situation Briefings (SitRep)** | ✅ Fully Implemented | `apps/api/app/ai/sitrep.py` | `GET /risk/sitrep/{zone_id}` generates commander briefs live. |
| **Hungarian Resource Allocation** | ✅ Fully Implemented | `apps/api/app/routes/allocate.py` | `scipy.optimize.linear_sum_assignment` solves travel-time cost matrix. |
| **OSRM Route + Polygon Avoidance** | ✅ Fully Implemented | `apps/api/app/services/osrm.py` | 2D line segment intersection tests reject flooded routes. |
| **Precomputed Route Fallback** | ✅ Fully Implemented | `data/demo_routes.json` | Fallback activates seamlessly if OSRM public server times out. |
| **Multilingual Alert Translation** | ✅ Fully Implemented | `apps/api/app/services/translate.py` | English, Hindi, and Marathi translations via Groq with fallback templates. |
| **Human-in-the-Loop Signoff** | ✅ Fully Implemented | `apps/web/src/components/ApprovalCard.tsx` | Two-step approve/send workflow enforced by API. |
| **AEGIS Operations Chatbot** | ✅ Fully Implemented | `apps/web/src/components/ChatBot.tsx` | Context-aware floating assistant with sliding-window IP rate limiting. |
| **10:42→10:52 Demo Scenario** | ✅ Fully Implemented | `apps/web/src/app/simulate/page.tsx` | Automated 8-step simulation script with live telemetry logger. |
| **MapLibre Ukiyo-e Cartography** | ✅ Fully Implemented | `apps/web/src/components/MapView.tsx` | Custom WebGL paint styling on raw OSM tiles; zero watermarks. |
| **Open-Meteo Weather Poller** | ✅ Fully Implemented | `apps/api/app/services/weather.py` | Async background poller with stale-cache fallback. |
| **In-Memory Datastore** | ✅ Fully Implemented | `apps/api/app/db/store.py` | Deep-copied seed state; zero external database dependency. |
| **PostgreSQL + PostGIS Schema** | ⚠️ Documented / Schema Ready | `apps/api/app/db/schema.sql` | Complete SQL schema specified; live demo uses in-memory store. |
| **Role-Based Access Control (RBAC)**| ⚠️ Partially Implemented | Simple UI roles (`Command`, `Responder`, `Citizen`) | No JWT/OAuth token verification middleware; all endpoints currently open. |
| **Real CCTV & Drone Ingestion** | ❌ Documented / Future Scope | Listed in PRD Section 5 | Explicitly out of scope for hackathon MVP; simulated via photos. |
| **Native Mobile Apps (iOS/Android)**| ❌ Documented / Future Scope | Listed in PRD Section 5 | Web responsive only; native app wrappers planned for future release. |
| **SMS Gateway / CAP Broadcast** | ❌ Documented / Future Scope | Simulated via PhonePreview bubble | Real SMS provider (Twilio / CDAC CAP) omitted to avoid paid SMS costs. |

---

## 13. Technical Challenges & Engineering Breakthroughs

### 1. Eliminating Tile Watermarks Without Paid Keys (D-022)
- *Challenge*: The original map configuration utilized CARTO dark raster tiles. Mid-development, CARTO introduced an unauthenticated tile watermark overlay reading *"API KEY REQUIRED"*, degrading the visual presentation of the command center.
- *Solution*: Replaced the tile source with official OpenStreetMap raster tiles and applied client-side WebGL paint transformations directly inside MapLibre GL (`raster-hue-rotate: 35`, `raster-saturation: -0.65`, `raster-contrast: 0.15`). This eliminated all watermarks while generating an authentic, warm washi paper woodblock aesthetic.

### 2. Preventing Evacuation Routes from Traversing Flooded Roadways (D-005)
- *Challenge*: Public OSRM servers are static and cannot accept dynamic road blockage constraints or custom avoidance polygons via HTTP query parameters.
- *Solution*: Implemented client-side and server-side geometric verification in `apps/api/app/services/osrm.py`. When OSRM returns candidate routes with `alternatives=3`, our backend iterates over every line segment of each route, executing a 2D vector cross-product intersection check against active hazard barriers and flood zone boundaries. Any route that intersects a hazard is rejected, guaranteeing that responders and citizens are never routed through floodwaters.

### 3. Sub-Second Multimodal Vision Verification Without Infrastructure Overhead (D-025)
- *Challenge*: Evaluating citizen photo submissions using traditional vision models or local Ollama instances required either heavy GPU servers or introduced 15–30 second inference delays, stalling live demo presentations.
- *Solution*: Integrated Groq's high-speed inference engine running Llama 3.2-11B Vision. This achieved multimodal photo classification and depth estimation in under 500 milliseconds. A three-tier fallback architecture (Groq → Gemini Flash → Heuristic) guarantees zero system crashes even during total network blackouts.

### 4. Flawless Devanagari Typography for Regional Indian Languages (D-027)
- *Challenge*: Initial multilingual alert previews in Hindi and Marathi rendered broken square boxes (tofu characters) because the primary display fonts (`Cinzel` and `Impact`) lack Unicode glyphs for Devanagari script.
- *Solution*: Added Google's `Noto Sans Devanagari` font to the root stylesheet and configured font fallbacks specifically for Hindi and Marathi tabs in `PhonePreview.tsx`. Character limits were capped at 300 to match SMS/CAP gateway protocols.

### 5. Turbopack CSS Import Resolution in Next.js 16 (D-021)
- *Challenge*: Next.js 16 with Turbopack threw compilation errors when external Google Fonts were imported after Tailwind directives in `globals.css`.
- *Solution*: Structured `globals.css` to declare external `@import url(...)` rules at the very top of the stylesheet before `@import "tailwindcss"`, adhering strictly to the W3C CSS Cascading and Inheritance specification.

---

## 14. Limitations & Future Roadmap

### Current Limitations
1. **In-Memory Volatility**: Because the current runtime utilizes `apps/api/app/db/store.py`, restarting the FastAPI process resets dynamically created reports unless saved to disk.
2. **Simplified Hydrological Physics**: The flood risk model utilizes an explainable empirical formula rather than a hydrodynamic 2D shallow-water differential equation solver.
3. **Open Access API Endpoints**: Endpoints lack JWT or session-based authentication middleware; anyone with network access can invoke API routes.
4. **Synthetic Image Sources**: Image verification in the demo utilizes Unsplash URLs and seed image links rather than direct camera hardware uploads.

### Production Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: ENTERPRISE DATA PERSISTENCE & AUTHENTICATION (Months 1–2)          │
│ • Wire PostgreSQL + PostGIS schema using SQLAlchemy AsyncIO                 │
│ • Implement Clerk / Supabase Auth with Role-Based Access Control (RBAC)     │
│ • Automated database migrations via Alembic                                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: ADVANCED HYDROLOGICAL & SENSOR INTEGRATIONS (Months 3–4)           │
│ • Integrate IoT ultrasonic water-level sensors via MQTT                     │
│ • Train an XGBoost model on historical municipal rainfall & drainage data   │
│ • Implement tidal harmonic prediction models for coastal drainage outlets   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: NATIONAL DISASTER INFRASTRUCTURE INTEGRATION (Months 5–6)          │
│ • Connect to India NDMA / CAP (Common Alerting Protocol) XML gateway        │
│ • Automated SMS dispatch via telecom gateways (BSNL, Jio, Airtel)           │
│ • Progressive Web App (PWA) offline caching with service workers            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Hackathon Demonstration Chronicle (10:42 → 10:52)

To present AEGISFLOW effectively to hackathon judges, navigate to **`/simulate`** and execute the automated chronicle or run the scenario manually following this exact chronological script:

| Time | Action on UI | System Event | What to Explain to Judges |
|---|---|---|---|
| **10:42** | Click **Set Rain: 55 mm/h** | `rain.updated` | *"Our weather ingest detects a sudden monsoon cloudburst over Kurla. The rainfall telemetry immediately registers across the entire system."* |
| **10:45** | View `/command` Risk Matrix | `risk.updated` | *"Watch the map: Kurla West immediately transitions from green to deep vermilion. The 'Why' panel decomposes the risk: 40% rain + 25% elevation deficit + 20% history."* |
| **10:47** | Click **Inject 23 Reports** | `report.submitted` | *"Citizens begin panicking. 23 separate distress reports are submitted from mobile devices across the Kurla railway station corridor."* |
| **10:48** | View `/incidents` Queue | `incident.created` | *"Traditional dispatch centers would collapse under 23 individual tickets. AEGISFLOW's spatial clustering collapses 17 duplicates within 150m into 1 consolidated verified incident."* |
| **10:49** | Click **Deploy Road Barrier** | `road.blocked` | *"Emergency services deploy a hazard barrier on LBS Marg due to high water. The roadway is instantly tagged as impassable."* |
| **10:50** | View `/responder` HUD | `route.recalculated` | *"Watch the responder's navigation: the evacuation corridor dynamically redraws around the blocked barrier, routing safely along higher-elevation avenues."* |
| **10:51** | Click **Run Resource Allocation**| `resource.assigned` | *"Our Hungarian optimization solver builds a travel-time cost matrix and automatically assigns Rescue Unit Alpha to the critical incident in under 5 milliseconds."* |
| **10:52** | Click **Approve & Broadcast** | `alert.approved` & `alert.sent` | *"Human-in-the-loop governance: The commander approves the alert. Groq Llama 3.3 translates it into Hindi and Marathi, publishing verified safety instructions to all citizen screens."* |

---

## 16. Comprehensive Viva & Judge Defense Questions

### Question 1: "Why did you build an explainable formula instead of training a deep neural network or XGBoost model for flood risk?"
**Answer:**  
In high-consequence disaster management, **black-box models are dangerous and unacceptable to emergency commanders**. If a neural network marks a neighbourhood as 'safe' and citizens drown, nobody can explain why. Our four-factor formula ($0.40 \cdot \text{Rain} + 0.25 \cdot \text{Elevation} + 0.20 \cdot \text{History} + 0.15 \cdot \text{Density}$) is:
1. **Auditable**: Commanders can inspect the exact contribution of each factor directly in the UI.
2. **Defensible**: It uses physical laws (gravity and low elevation) and empirical municipal records.
3. **Instantaneous**: It calculates in microseconds without needing expensive GPU inference.  
Furthermore, our architecture is modular: an XGBoost regressor can be swapped into `apps/api/app/ai/risk.py` in the future without changing a single API contract or frontend component.

### Question 2: "How does your duplicate detection work, and why not use pure text embeddings?"
**Answer:**  
We deliberately rejected relying purely on sentence embeddings (Architecture Decision D-004). During a flood, two people 5 kilometers apart might send identical text: *"My street is flooded, send help!"* Pure text embeddings would erroneously group them into one incident.  
AEGISFLOW implements **Spatio-Temporal Haversine Clustering**:
1. It first tests physical proximity ($d \le 150\text{ meters}$) using the spherical Haversine formula.
2. It then tests temporal relevance ($|\Delta t| \le 30\text{ minutes}$).  
Only reports that are both spatially and temporally coincident are grouped into the same cluster. Groq Llama 3.3 is then used to synthesize the consolidated text descriptions into an executive dispatch summary.

### Question 3: "Why did you use Groq Llama 3.2 Vision instead of YOLO for photo verification?"
**Answer:**  
Stock YOLO models (such as YOLOv8 or YOLOv11) are trained on the COCO dataset, which recognizes 80 common objects: cars, bicycles, people, dogs, and backpacks. **YOLO has no concept of water level, street inundation, or urban flood hazards**.  
Training a custom CNN or YOLO segmentation head requires thousands of annotated flood images and risks severe overfitting. Multimodal vision LLMs (Groq Llama 3.2 Vision and Gemini 2.0 Flash) possess contextual semantic understanding: they recognize water interacting with car tires, curb heights, and pedestrian legs, accurately categorizing depth into `ankle`, `knee`, and `waist+` in under 500 milliseconds.

### Question 4: "What happens if the internet goes down or your LLM API keys expire during a flood?"
**Answer:**  
This is our core **Zero-Failure Principle** (Decision D-003, D-025). AEGISFLOW is engineered so that **no external API failure can ever crash the operational loop**:
- If Groq Vision fails, it falls back to Gemini; if Gemini fails, it falls back to a deterministic heuristic rule based on depth chips.
- If Open-Meteo weather is unreachable, the poller serves the last cached precipitation reading.
- If OSRM routing is slow, it falls back to precomputed safe corridors in `demo_routes.json`.
- If translation fails, it pulls pre-translated Hindi and Marathi text from `data/alert_templates.json`.
- If Groq for the chatbot fails, a keyword-matching heuristic engine provides immediate answers.

### Question 5: "How does your routing engine prevent routing emergency vehicles through flooded roads?"
**Answer:**  
Standard OSRM or Google Maps routing minimizes travel time over a static street graph; it does not know if a road is under 2 meters of water.  
In `apps/api/app/services/osrm.py`, we request candidate paths with alternative routes. We then run a **2D line segment intersection algorithm using vector cross products** between the candidate route coordinates and active blocked-road or flood polygons. If any segment intersects an active hazard, that candidate is rejected. If all candidates intersect hazards, the API returns `"status": "no_safe_route"` so dispatchers never guide vehicles into deadly traps.

### Question 6: "Why did you use the Hungarian algorithm for resource allocation instead of a simple greedy nearest-neighbour search?"
**Answer:**  
Greedy algorithms make myopic, locally optimal choices that produce globally terrible disaster outcomes.  
*Example*: If Incident A is 1 km from Team 1 and 2 km from Team 2, while Critical Incident B is 1.1 km from Team 1 and 10 km from Team 2:
- A greedy algorithm assigns Team 1 to Incident A (distance 1 km), forcing Incident B to wait for Team 2 (distance 10 km, total travel distance = 11 km).
- The Hungarian algorithm (`scipy.optimize.linear_sum_assignment`) considers the global cost matrix, assigning Team 2 to Incident A and Team 1 to Incident B, minimizing total transit time and prioritizing the higher severity incident.

### Question 7: "Why did you use an in-memory store in `store.py` instead of requiring PostgreSQL + PostGIS at runtime?"
**Answer:**  
In hackathon environments and emergency disaster edge deployments, databases are a major point of failure: connection strings fail, local PostgreSQL services stop, and network latency degrades performance.  
Our in-memory store (`apps/api/app/db/store.py`):
1. Runs 100% self-contained with zero external dependencies.
2. Executes reads and writes in sub-millisecond RAM time.
3. Allows 1-click total system resets during live demonstrations (`POST /simulate/reset`).  
Crucially, we have fully authored the production SQL schema (`apps/api/app/db/schema.sql`) with GiST spatial indexes and CHECK constraints, proving that the system is ready for managed PostGIS deployment.

### Question 8: "Why does the UI use the Ukiyo-e Woodblock Revival design instead of a standard generic dashboard?"
**Answer:**  
Emergency operations centers are high-stress environments where operators stare at screens for 12+ hour shifts. Standard dark dashboards suffer from low contrast, unreadable neon saturation, and generic aesthetic fatigue.  
The **Ukiyo-e Woodblock Revival** design system:
1. Utilizes decisive, thick sumi ink outlines (`#0D0D15`) and tactile offset shadows (`3px 3px 0 #0D0D15`), establishing unmistakable visual hierarchy.
2. Employs traditional mineral pigments (Vermilion `#E85D35`, Prussian Blue `#003153`, Pine Green `#2D7F67`) that maintain 4.5:1 WCAG contrast ratios.
3. Contains **zero emojis and zero pure blacks (`#000000`)**, ensuring professional seriousness and unmatched memorability during hackathon evaluation.

### Question 9: "How do you handle real-time synchronization between the commander, responders, and citizens?"
**Answer:**  
We use an asynchronous WebSocket pipeline hosted at `/ws/events` in `apps/api/app/ws.py`. Whenever any state-mutating action occurs—such as a report being ingested, a road being blocked, or an alert being approved—the backend constructs a typed `DomainEvent` envelope and broadcasts it concurrently to all connected clients.  
On the frontend, our custom `useEvents` hook parses these events and updates React component state in memory without triggering page refreshes. If the socket connection drops, it reconnects automatically using exponential backoff.

### Question 10: "Why is human-in-the-loop required for emergency alerts?"
**Answer:**  
Fully autonomous emergency alerts present unacceptable legal and public safety liability. An AI model hallucination or false sensor spike could trigger widespread public panic, highway stampedes, or economic disruption.  
In AEGISFLOW, the AI acts strictly as an **intelligence advisor**: it drafts the alert, computes the risk score, and recommends actions, but the alert remains in a `pending` status until an authorized human commander clicks **Approve & Broadcast**.

---

## 17. Conclusion & Architectural Summary

AEGISFLOW transforms urban flood management from a disjointed, reactive struggle into a coordinated, intelligent, and proactive operation. By integrating explainable mathematical modeling, high-speed multimodal vision verification, dynamic hazard-avoiding routing, and optimal resource allocation within a culturally distinctive, resilient architecture, AEGISFLOW demonstrates that modern software engineering can directly safeguard human lives during municipal catastrophes.

*AEGISFLOW — From warning to response. Detect earlier. Verify better. Route safer. Respond together.*
