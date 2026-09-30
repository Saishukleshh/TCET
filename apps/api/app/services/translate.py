"""
services/translate.py — Multilingual alert translation (Phase 4b).

Produces {en, hi, mr} translations for an alert message.
Primary: Groq Llama 3.3 (fast, JSON mode).
Fallback: data/alert_templates.json with placeholder substitution.
Translations are cached on the alert dict under key "translations".
"""

from __future__ import annotations
import json
from pathlib import Path
from app.ai.groq_client import chat_completion, extract_json, is_groq_available

_TEMPLATES_PATH = Path(__file__).parent.parent.parent.parent.parent / "data" / "alert_templates.json"
_templates: dict = {}


def _load_templates() -> dict:
    global _templates
    if not _templates:
        if _TEMPLATES_PATH.exists():
            _templates = json.loads(_TEMPLATES_PATH.read_text(encoding="utf-8"))
    return _templates


def _fill(template: str, zone: str, avoid: str, shelter: str) -> str:
    return (template
            .replace("{zone}", zone)
            .replace("{avoid}", avoid)
            .replace("{shelter}", shelter))


def _fallback(tier: str, zone: str, avoid: str, shelter: str) -> dict[str, str]:
    tpl = _load_templates().get(tier, _load_templates().get("warning", {}))
    return {
        "en": _fill(tpl.get("en", ""), zone, avoid, shelter),
        "hi": _fill(tpl.get("hi", ""), zone, avoid, shelter),
        "mr": _fill(tpl.get("mr", ""), zone, avoid, shelter),
    }


async def translate_alert(
    message_en: str,
    tier: str,
    zone: str,
    avoid: str = "flooded arterials",
    shelter: str = "nearest designated shelter",
) -> dict[str, str]:
    """
    Return {"en": ..., "hi": ..., "mr": ...}.
    Tries Groq first; falls back to hardcoded templates on any failure.
    Each message is kept under ~300 characters.
    """
    if is_groq_available():
        prompt = (
            "Translate the following emergency flood alert into Hindi and Marathi. "
            "Keep each translation under 300 characters. Use clear, simple language. "
            "Do NOT say 'guaranteed safe' — say 'verified route' or 'recommended shelter'. "
            "Return ONLY valid JSON with keys: {\"hi\": \"...\", \"mr\": \"...\"}.\n\n"
            f"English alert: {message_en}"
        )
        try:
            raw = await chat_completion(
                messages=[{"role": "user", "content": prompt}],
                json_mode=True,
                max_tokens=300,
                timeout_sec=6.0,
            )
            if raw:
                parsed = extract_json(raw)
                if parsed and "hi" in parsed and "mr" in parsed:
                    hi = str(parsed["hi"])[:300]
                    mr = str(parsed["mr"])[:300]
                    return {"en": message_en[:300], "hi": hi, "mr": mr}
        except Exception:
            pass

    # Fallback to hardcoded templates
    fb = _fallback(tier, zone, avoid, shelter)
    fb["en"] = message_en[:300] if message_en else fb["en"]
    return fb
