"""
ai/groq_client.py — High-performance Groq LLM client (Llama 3.3 & Llama 3.2 Vision).

Uses Groq's OpenAI-compatible endpoint for sub-second inference.
Falls back safely to local deterministic logic if GROQ_API_KEY is not configured or unreachable.
"""

from __future__ import annotations
import os
import re
import json
import logging
from typing import Optional, Any
import httpx

log = logging.getLogger(__name__)

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

# Recommended Groq models — read lazily so .env is loaded first
_DEFAULT_TEXT_MODEL = "llama-3.3-70b-versatile"
_DEFAULT_VISION_MODEL = "llama-3.2-11b-vision-preview"


def _text_model() -> str:
    return os.getenv("GROQ_TEXT_MODEL", _DEFAULT_TEXT_MODEL)


def _vision_model() -> str:
    return os.getenv("GROQ_VISION_MODEL", _DEFAULT_VISION_MODEL)


# Backwards-compat aliases (evaluated lazily now)
TEXT_MODEL = _DEFAULT_TEXT_MODEL
VISION_MODEL = _DEFAULT_VISION_MODEL


def get_api_key() -> str:
    """Retrieve Groq API key from environment, checking GROQ_API_KEY or LLM_API_KEY."""
    return os.getenv("GROQ_API_KEY", "").strip() or os.getenv("LLM_API_KEY", "").strip()


def is_groq_available() -> bool:
    """Check if a Groq key is present."""
    return bool(get_api_key())


async def chat_completion(
    messages: list[dict[str, Any]],
    model: str | None = None,
    temperature: float = 0.1,
    max_tokens: int = 1024,
    json_mode: bool = True,
    timeout_sec: float = 7.0,
) -> Optional[str]:
    if model is None:
        model = _text_model()
    """
    Execute a chat completion on Groq with low latency.
    Returns the string completion or None on failure/missing key.
    """
    api_key = get_api_key()
    if not api_key:
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    try:
        async with httpx.AsyncClient(timeout=timeout_sec) as client:
            resp = await client.post(GROQ_ENDPOINT, json=payload, headers=headers)
            if resp.status_code != 200:
                log.warning("Groq chat_completion HTTP %s: %s", resp.status_code, resp.text[:300])
                return None
            data = resp.json()
            content = data["choices"][0]["message"].get("content") or ""
            if not content.strip():
                log.warning("Groq returned empty content for model=%s", model)
                return None
            return content
    except Exception as exc:
        log.warning("Groq chat_completion exception: %s", exc)
        return None


async def vision_completion(
    image_url: str,
    prompt: str,
    model: str | None = None,
    timeout_sec: float = 8.0,
) -> Optional[str]:
    if model is None:
        model = _vision_model()
    """
    Analyze an image via Groq Llama 3.2 Vision.
    Returns the raw response string or None on failure.
    """
    api_key = get_api_key()
    if not api_key or not image_url:
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": image_url},
                },
            ],
        }
    ]

    # NOTE: Vision models (llama-3.2-11b-vision-preview) do NOT support
    # response_format=json_object — omitting it to prevent empty-output errors.
    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": 0.1,
        "max_tokens": 512,
    }

    try:
        async with httpx.AsyncClient(timeout=timeout_sec) as client:
            resp = await client.post(GROQ_ENDPOINT, json=payload, headers=headers)
            if resp.status_code != 200:
                log.warning("Groq vision_completion HTTP %s: %s", resp.status_code, resp.text[:300])
                return None
            data = resp.json()
            content = data["choices"][0]["message"].get("content") or ""
            if not content.strip():
                log.warning("Groq vision returned empty content for model=%s", model)
                return None
            return content
    except Exception as exc:
        log.warning("Groq vision_completion exception: %s", exc)
        return None


def extract_json(raw_text: str) -> Optional[dict]:
    """Extract and parse JSON object from LLM response, stripping any markdown wrappers."""
    if not raw_text:
        return None
    try:
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text.strip(), flags=re.MULTILINE)
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start != -1 and end > start:
            return json.loads(cleaned[start:end])
        return json.loads(cleaned)
    except Exception:
        return None
