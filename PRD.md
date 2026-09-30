# PRD: AEGISFLOW, Intelligent Disaster Management & Urban Flood Prediction (Hackconquest PS 14)

**Tagline:** From warning to response. Detect earlier. Verify better. Route safer. Respond together.

## 1. Problem
Urban flooding is not just a prediction problem; it is a response-coordination problem. Weather forecasts, geographic data, citizen reports, road conditions and emergency resources arrive separately. The gap between "we know something is happening" and "we know what to do next" delays decisions. Reports can be duplicated, outdated or false, and a route that was safe minutes ago may not be safe now.

## 2. Goal
Turn fragmented real-time signals into verified incidents, dynamic risk intelligence and recommended response actions, on one operational picture.

## 3. Users
| User | Need |
|---|---|
| Command (authorities) | One prioritized picture; approve alerts; allocate resources |
| Field responders | Assignment, safe route, live incident status |
| Citizens | Easy reporting, verified alerts, safe route and nearby shelter |

## 4. Requirements (mapped to the problem statement)
| # | Requirement | Must / Should | Acceptance test |
|---|---|---|---|
| R1 | Aggregate weather forecasts, social/citizen signals, geographic data, resource availability | Must | Dashboard shows rainfall layer, reports, zones, shelters and teams together |
| R2 | Flood-risk modelling | Must | Zone risk score updates when the rain slider changes, with a "why" breakdown |
| R3 | Geospatial vulnerability mapping | Must | Map colours zones by vulnerability (elevation, past flooding, exposure) |
| R4 | Real-time incident verification | Must | Report + photo returns Verified / Probable / Unverified with evidence |
| R5 | Duplicate detection | Should | 17 nearby reports collapse into 1 incident with a count |
| R6 | Dynamic evacuation routes | Must | When a road is marked unsafe, the route recalculates and avoids flooded areas |
| R7 | Resource allocation optimization | Must | Teams/shelters assigned to incidents by severity and distance; capacity respected |
| R8 | Severity-based alerts for response teams | Must | Alert tier (Watch / Warning / Critical) with command approval before sending |
| R9 | Live updates | Should | New reports appear on the map without refresh |
| R10 | Human-in-the-loop | Should | Critical actions need Approve / Reject |

## 5. Out of scope
Real CCTV/social integrations, production-grade hydrological modelling, real SMS/push delivery, multi-city rollout, native apps.

## 6. Success = demo (one incident, one decision)
```
10:42  Rainfall anomaly detected
10:45  Flood risk: HIGH (zone turns red, "why" panel)
10:47  23 citizen reports received
10:48  17 duplicates -> 1 verified incident (photo checked)
10:49  Road marked unsafe
10:50  Evacuation route recalculated
10:51  Emergency resources assigned
10:52  Affected population alert approved and sent
```

## 7. PPT plan (max 7 slides, visuals over paragraphs)
| # | Slide | Key visual |
|---|---|---|
| 1 | Title: AEGISFLOW | City map hero with rainfall, red zones, route |
| 2 | Problem and root cause | Fragmentation diagram: sources -> fragmentation -> delayed decisions |
| 3 | Proposed solution | Pipeline: Ingest -> Verify -> Understand -> Optimize -> Act |
| 4 | Technical architecture and methodology | Layered architecture diagram + stack line |
| 5 | Impact, feasibility, risks, future | 4-quadrant infographic + Prototype -> Pilot -> City -> Multi-city |
| 6 | References and wrap-up | Sources + large closing line |
| 7 | One incident, one decision | Timeline (above) |

Impact is stated as what we will **measure** (triage time, duplicate reduction, route recalculation, resource utilization), not invented numbers.

## 8. Risks
| Risk | Mitigation |
|---|---|
| False or duplicate reports | Multi-signal verification, geo+time clustering, confidence labels |
| Bad data | Source provenance, confidence scores |
| Model error | Human approval for critical actions |
| Network/API failure | Cached data, precomputed fallback routes |
| Public routing server slow | Precomputed demo routes |
| Scope creep | Follow the MVP cut order in tasks.md |
