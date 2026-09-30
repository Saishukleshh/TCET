"""
ai/sitrep.py — Commander Situation Briefings & Public Alerts via Groq Llama 3.3.

Provides automated intelligence briefings synthesizing rainfall, topographic vulnerability,
incident clusters, and resource availability for decision makers.
Strict compliance with AGENTS.md: Uses "risk assessment" and "recommended action", never "guaranteed safe".
"""

from __future__ import annotations
from typing import Any
from app.ai.groq_client import chat_completion, extract_json, is_groq_available


async def generate_situation_brief(
    zone_name: str,
    risk_score: float,
    rainfall_mm_h: float,
    incident_count: int,
    open_shelters_count: int,
    available_teams: int,
) -> dict[str, Any]:
    """
    Generate an executive operational briefing for emergency commanders.
    """
    if is_groq_available():
        prompt = f"""You are the senior tactical flood intelligence advisor for AEGISFLOW disaster management.
Generate a structured operational situation report for the following live conditions:
- Sector: {zone_name}
- Current Flood Risk Score: {risk_score:.0%}
- Precipitation Intensity: {rainfall_mm_h:.1f} mm/h
- Active Incident Clusters: {incident_count}
- Designated Open Evacuation Shelters: {open_shelters_count}
- Ready Field Rescue Units: {available_teams}

Rules:
1. Use professional, decisive disaster response terminology.
2. Refer to "risk assessment" and "recommended action", never "guaranteed safe".
3. Return ONLY valid JSON matching this schema:
{{
  "headline": "Short bold sector headline",
  "tactical_assessment": "2-3 sentence assessment of flood progression and vulnerabilities",
  "recommended_actions": [
    "action 1",
    "action 2"
  ],
  "alert_tier": "critical" or "warning" or "watch"
}}"""

        try:
            raw = await chat_completion(
                messages=[{"role": "user", "content": prompt}],
                json_mode=True,
                max_tokens=300,
                timeout_sec=5.0,
            )
            if raw:
                parsed = extract_json(raw)
                if parsed and "headline" in parsed:
                    return parsed
        except Exception:
            pass

    # Deterministic fallback briefing
    tier = "critical" if risk_score >= 0.70 else "warning" if risk_score >= 0.45 else "watch"
    return {
        "headline": f"{tier.upper()} FLOOD RISK IN {zone_name.upper()}",
        "tactical_assessment": (
            f"Precipitation of {rainfall_mm_h:.1f} mm/h combined with low-lying elevation has produced "
            f"a risk assessment score of {risk_score:.0%}. {incident_count} verified incident clusters are active."
        ),
        "recommended_actions": [
            "Pre-position swift-water rescue teams along safe perimeter corridors.",
            "Verify shelter ingress routes avoiding submerged arterial roadways.",
            "Issue targeted citizen evacuation recommendations for low-lying tenements.",
        ],
        "alert_tier": tier,
    }


async def generate_citizen_alert_draft(
    zone_name: str,
    tier: str,
    risk_score: float,
    shelter_name: str,
) -> str:
    """
    Draft a citizen alert message awaiting human commander signoff.
    """
    if is_groq_available():
        prompt = f"""Draft a public emergency alert for residents of {zone_name}.
Severity Tier: {tier.upper()}
Calculated Flood Risk: {risk_score:.0%}
Nearest Safe Haven: {shelter_name}

Rules:
- Max 240 characters (SMS/CAP compatible).
- Urgent, clear, and reassuring tone.
- Do not say 'guaranteed safe' (say 'verified route' or 'recommended shelter').
- Return valid JSON: {{"message": "..."}}"""

        try:
            raw = await chat_completion(
                messages=[{"role": "user", "content": prompt}],
                json_mode=True,
                max_tokens=100,
                timeout_sec=4.0,
            )
            if raw:
                parsed = extract_json(raw)
                if parsed and "message" in parsed:
                    return str(parsed["message"])
        except Exception:
            pass

    # Deterministic template fallback
    return (
        f"EMERGENCY FLOOD {tier.upper()} for {zone_name}. Risk assessment {risk_score:.0%}. "
        f"Avoid waterlogged arterials. Proceed immediately to designated shelter at {shelter_name} via verified corridors."
    )
