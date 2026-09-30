"""
services/weather.py — Weather ingest from Open-Meteo (free, no key needed).
Polls for rainfall intensity for the Mumbai demo area.
Caches the last good reading; returns cached value on API failure.
"""

from __future__ import annotations
import asyncio
import httpx
from datetime import datetime, timezone

# Demo centre: Kurla, Mumbai
_LAT = 19.068
_LNG = 72.877

# Cache
_cache: dict = {"intensity_mm_h": 0.0, "ts": None, "source": "open-meteo"}
_POLL_INTERVAL_SEC = 120  # poll every 2 minutes

# Open-Meteo free API — no key required
_OPEN_METEO_URL = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude={lat}&longitude={lng}"
    "&current=precipitation"
    "&forecast_days=1"
)


async def fetch_current_rainfall() -> float:
    """
    Fetch current precipitation (mm/h) from Open-Meteo.
    Returns cached value on failure. Never raises.
    """
    url = _OPEN_METEO_URL.format(lat=_LAT, lng=_LNG)
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
        intensity = float(data["current"]["precipitation"])
        _cache["intensity_mm_h"] = intensity
        _cache["ts"] = datetime.now(timezone.utc).isoformat()
        _cache["source"] = "open-meteo"
    except Exception:
        # Return stale cached value; mark as cached
        _cache["source"] = "cached-fallback"
    return _cache["intensity_mm_h"]


def get_cached() -> dict:
    return dict(_cache)


async def poller(broadcast_fn) -> None:
    """
    Background task: poll weather, update store rainfall, broadcast rain.updated.
    Call as: asyncio.create_task(poller(broadcast))
    """
    from app.db import store
    while True:
        try:
            intensity = await fetch_current_rainfall()
            # Apply to all zones equally (demo simplification)
            for zone_id in store.rainfall:
                store.rainfall[zone_id] = intensity
            await broadcast_fn("rain.updated", {"intensity_mm_h": intensity, "source": _cache["source"]})
        except Exception:
            pass
        await asyncio.sleep(_POLL_INTERVAL_SEC)
