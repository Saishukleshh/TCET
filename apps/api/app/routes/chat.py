"""
routes/chat.py — AEGISFLOW AI Assistant chatbot endpoint.

Uses Groq Llama 3.3-70b-versatile for real-time answers.
Context-aware: reads live incidents, zones, shelters, teams from the in-memory store.
Falls back to deterministic canned answers when Groq is unavailable.
Rate limiting: 20 messages per IP per minute (in-memory sliding window).
"""

from __future__ import annotations
import time
from collections import defaultdict, deque
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.ai.groq_client import chat_completion, is_groq_available
from app.db import store

router = APIRouter()

# ── Rate limiting (20 requests / 60 seconds / IP) ────────────────────────────
_RATE_LIMIT = 20
_RATE_WINDOW = 60  # seconds
_ip_windows: dict[str, deque] = defaultdict(deque)


def _is_rate_limited(ip: str) -> bool:
    now = time.monotonic()
    dq = _ip_windows[ip]
    # Remove timestamps older than the window
    while dq and dq[0] < now - _RATE_WINDOW:
        dq.popleft()
    if len(dq) >= _RATE_LIMIT:
        return True
    dq.append(now)
    return False


# ── Schemas ───────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    page_context: Optional[str] = None  # e.g. "/command", "/report", "/responder"


class ChatResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    reply: str
    model_used: str
    rate_limit_remaining: int


# ── System prompt ─────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are AEGIS — the AI Operations Assistant embedded inside AEGISFLOW, an intelligent urban flood prediction and disaster management system built for Mumbai.

## Your Role
You are a real-time emergency decision support bot. You help:
- Incident Commanders on /command understand flood risk, approve/reject alerts, dispatch teams
- Field Responders on /responder know their mission, route, and safe evacuation corridors
- Citizens on /report understand how to submit flood reports and find the nearest safe shelter
- Demo judges on /simulate understand all system capabilities
- Anyone with doubts about how AEGISFLOW works

## Navigation Guide (ROUTE USERS DIRECTLY)
When users ask where something is, give the exact URL path:
- Dashboard & live map → /command
- Full incident triage list → /incidents
- Shelter & rescue team tracker → /resources  
- Field team tactical HUD → /responder
- Submit a flood report (citizen) → /report
- 10-minute demo simulator → /simulate
- Swagger API docs → http://127.0.0.1:8000/docs

## Core AEGISFLOW Capabilities You Can Explain
1. **Risk Formula**: Risk = 0.40×Rainfall + 0.25×LowElevation + 0.20×FloodHistory + 0.15×IncidentDensity
2. **Deduplication**: 150m / 30-min clustering collapses duplicate citizen reports into 1 incident
3. **Status vocab**: Incidents: `verified | probable | unverified`. Alerts: `watch | warning | critical`
4. **Routing**: OSRM + Shapely polygon avoidance — never routes through active flood zones
5. **Resource allocation**: Hungarian algorithm (scipy.optimize.linear_sum_assignment) assigns teams to incidents by travel time and severity
6. **Human-in-the-loop**: ALL critical alerts require Commander approval before broadcasting to citizens
7. **Multilingual alerts**: EN / Hindi / Marathi via Groq Llama 3.3
8. **Vision AI**: Groq Llama 3.2 Vision verifies flood photos from citizen reports

## Live System State (Injected at Runtime)
{live_context}

## Response Rules
- Keep replies concise (under 200 words unless the user asks for detail)
- Use bullet points for lists
- Always mention the exact page URL when routing someone
- Never say "guaranteed safe" — use "recommended" or "assessed safe"
- If confidence is needed, be explicit about it
- Be calm, professional, and decisive — this is emergency ops
- Speak in the same language the user writes in (English, Hindi, Marathi all supported)"""


def _build_live_context() -> str:
    """Build a snapshot of live system state for the LLM context."""
    try:
        incidents = store.incidents
        shelters = store.shelters
        teams = store.teams
        alerts = store.alerts
        zones_fc = store.get_zones()

        active_incidents = [i for i in incidents if i.get("status") != "closed"]
        critical = [i for i in active_incidents if i.get("severity") == "critical"]
        available_teams = [t for t in teams if t.get("status") == "available"]
        pending_alerts = [a for a in alerts if a.get("status") == "pending"]
        open_shelters = [s for s in shelters if s.get("current_occupancy", 0) < s.get("capacity", 999)]

        # Top risk zones
        zone_risks = []
        for f in zones_fc:
            props = f.get("properties", {})
            zone_risks.append((props.get("name", "?"), props.get("risk", 0)))
        zone_risks.sort(key=lambda x: x[1], reverse=True)
        top_zones = zone_risks[:3]

        ctx_lines = [
            f"- Active incidents: {len(active_incidents)} ({len(critical)} critical)",
            f"- Available rescue teams: {len(available_teams)}/{len(teams)}",
            f"- Pending commander approvals: {len(pending_alerts)}",
            f"- Open evacuation shelters: {len(open_shelters)}/{len(shelters)}",
        ]
        if top_zones:
            zone_str = ", ".join(f"{n} ({int(r*100)}%)" for n, r in top_zones)
            ctx_lines.append(f"- Highest risk zones: {zone_str}")

        return "\n".join(ctx_lines)
    except Exception:
        return "- Live state unavailable (store not seeded)"


# ── Fallback responses (no API key / Groq down) ───────────────────────────────

_FALLBACK_RESPONSES: dict[str, str] = {
    "route": "Navigate to /command for the full map dashboard, /incidents for the triage queue, /responder for the field HUD, /report for citizen submissions, and /simulate for the demo runner.",
    "incident": "Incidents are classified as **verified | probable | unverified**. Critical incidents require commander approval before an alert is dispatched. Go to /incidents or click an incident marker on /command.",
    "shelter": "Evacuation shelter status is live on /resources. Shelters with available capacity are marked green on the /command map.",
    "route": "Evacuation routes are computed via OSRM and automatically avoid active flood zones. View safe corridors on /command or check /responder for your assigned route.",
    "risk": "Risk = 0.40×Rainfall + 0.25×LowElevation + 0.20×FloodHistory + 0.15×IncidentDensity. Click any zone on /command → Risk Matrix tab to see the live factor breakdown.",
    "alert": "Alerts require commander approval before sending. Go to /command — pending approvals appear as overlay cards on the map.",
    "report": "Submit a flood report at /report. Include GPS location, water depth (ankle/knee/waist+), and a photo if available. Groq Vision AI will verify the photo automatically.",
    "simulate": "The 10-minute demo scenario runs at /simulate. Press START DEMO SCENARIO to trigger the full Kurla West flood event sequence.",
    "team": "Rescue teams are auto-assigned via the Hungarian algorithm on /command → DISPATCH OPTIMIZER button. View all units at /resources.",
    "default": "I'm AEGIS, the AEGISFLOW Operations Assistant. I can help you navigate the system, explain risk scores, track incidents, find shelters, or understand how evacuation routing works. What do you need?",
}


def _fallback_reply(user_msg: str) -> str:
    lower = user_msg.lower()
    for key, resp in _FALLBACK_RESPONSES.items():
        if key in lower:
            return resp
    return _FALLBACK_RESPONSES["default"]


# ── Chat endpoint ─────────────────────────────────────────────────────────────

@router.post("/", response_model=ChatResponse)
async def chat(request: Request, body: ChatRequest):
    client_ip = request.client.host if request.client else "unknown"

    if _is_rate_limited(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit reached: 20 messages per minute. Please wait before sending more.",
        )

    # Calculate remaining quota
    dq = _ip_windows[client_ip]
    now = time.monotonic()
    recent = sum(1 for ts in dq if ts > now - _RATE_WINDOW)
    remaining = max(0, _RATE_LIMIT - recent)

    # Build full message list for Groq
    live_ctx = _build_live_context()
    system_content = _SYSTEM_PROMPT.format(live_context=live_ctx)
    if body.page_context:
        system_content += f"\n\n## Current Page\nThe user is on: {body.page_context}"

    messages = [{"role": "system", "content": system_content}]
    for m in body.messages[-12:]:  # keep last 12 turns to stay within context
        messages.append({"role": m.role, "content": m.content})

    if is_groq_available():
        reply = await chat_completion(
            messages=messages,
            temperature=0.4,
            max_tokens=512,
            json_mode=False,
        )
        if reply:
            return ChatResponse(reply=reply, model_used="groq/llama-3.3-70b-versatile", rate_limit_remaining=remaining)

    # Fallback
    user_msg = body.messages[-1].content if body.messages else ""
    return ChatResponse(
        reply=_fallback_reply(user_msg),
        model_used="fallback-deterministic",
        rate_limit_remaining=remaining,
    )
