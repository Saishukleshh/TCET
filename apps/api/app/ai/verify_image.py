"""
ai/verify_image.py — Photo verification via vision-capable LLM (D-003).

Sends image_url to a vision LLM with a strict prompt.
Fallback: if API fails, SSRF detected, or no key → returns "unverified" with confidence 0.
"""

from __future__ import annotations
import os
import json
import re
from urllib.parse import urlparse
import httpx

_API_KEY = os.getenv("LLM_API_KEY", "")
_MODEL = os.getenv("LLM_MODEL", "gemini-2.0-flash")
_GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

_PROMPT = """You are an emergency flood assessment system.
Analyse the image and respond with ONLY valid JSON:
{
  "shows_flooding": true or false,
  "depth_estimate": "ankle" or "knee" or "waist+" or null,
  "confidence": 0.0 to 1.0,
  "model_used": "gemini"
}
If the image is unclear or does not show a street scene, set shows_flooding to false and confidence to 0.2."""


def _fallback(reason: str = "api-unavailable") -> dict:
    return {
        "shows_flooding": False,
        "depth_estimate": None,
        "confidence": 0.0,
        "model_used": f"fallback-{reason}",
    }


def _is_safe_url(url: str) -> bool:
    """Validate that the URL is public HTTP/HTTPS and not targeting internal loopback or cloud metadata."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        hostname = (parsed.hostname or "").lower()
        if not hostname:
            return False
        # Block localhost and private/metadata addresses
        if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"):
            return False
        if hostname.startswith("10.") or hostname.startswith("192.168."):
            return False
        return True
    except Exception:
        return False


async def verify_image(image_url: str) -> dict:
    """
    Verify whether an image shows flooding.
    Returns a dict matching ImageVerificationResult schema.
    Falls back gracefully if the LLM API is unavailable.
    """
    if not _API_KEY or not image_url:
        return _fallback("no-key")

    if not _is_safe_url(image_url):
        return _fallback("invalid-or-private-url")

    # Only pass public image URLs (never real personal images)
    try:
        url = _GEMINI_URL.format(model=_MODEL) + f"?key={_API_KEY}"
        body = {
            "contents": [{
                "parts": [
                    {"text": _PROMPT},
                    {"text": f"Image URL: {image_url}. Assess whether it shows street flooding."},
                ]
            }]
        }

        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(url, json=body)
            resp.raise_for_status()
            data = resp.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]

        # Parse JSON robustly from markdown code fence or raw string
        clean_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
        start, end = clean_text.find("{"), clean_text.rfind("}") + 1
        if start == -1 or end <= start:
            return _fallback("unparseable-llm-response")

        result = json.loads(clean_text[start:end])

        # Validate structured output types & boundaries
        shows_flooding = bool(result.get("shows_flooding", False))
        depth = result.get("depth_estimate")
        if depth not in ("ankle", "knee", "waist+"):
            depth = None

        confidence = float(result.get("confidence", 0.0))
        confidence = max(0.0, min(1.0, confidence))

        return {
            "shows_flooding": shows_flooding,
            "depth_estimate": depth,
            "confidence": confidence,
            "model_used": "gemini",
        }
    except Exception as exc:
        return _fallback(f"error:{type(exc).__name__}")
