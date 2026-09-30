"""
services/alerts.py — Alert broadcasting, formatting, and delivery services.
Handles SMS/push message formatting and multi-channel dispatch.
"""

from __future__ import annotations
from typing import Optional


def format_citizen_broadcast(zone_name: str, tier: str, message: str) -> str:
    """Format emergency broadcast text for SMS/CAP alert systems."""
    prefix = f"[EMERGENCY ALERT - {tier.upper()}]"
    return f"{prefix} {zone_name}: {message} Follow designated safe evacuation routes."


def format_responder_dispatch(incident_id: str, severity: str, location_str: str) -> str:
    """Format dispatch alert payload for tactical responder units."""
    return f"DISPATCH: Incident #{incident_id[:8]} ({severity.upper()}) at {location_str}. Proceed via verified corridor."
