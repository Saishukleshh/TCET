"""
ai/groq_client.py — High-performance Groq LLM client (Llama 3.3 & Llama 3.2 Vision).

Uses Groq's OpenAI-compatible endpoint for sub-second inference.
Falls back safely to local deterministic logic if GROQ_API_KEY is not configured or unreachable.
"""

from __future__ import annotations
import os
import re
import json
from typing import Optional, Any
import httpx

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

# Recommended Groq models
TEXT_MODEL = os.getenv("GROQ_TEXT_MODEL", "llama-3.3-70b-versatile")
VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")


def get_api_key() -> str:
    """Retrieve Groq API key from environment, checking GROQ_API_KEY or LLM_API_KEY."""
    return os.getenv("GROQ_API_KEY", "").strip() or os.getenv("LLM_API_KEY", "").strip()


def is_groq_available() -> bool:
    """Check if a Groq key is present."""
    return bool(get_api_key())


async def chat_completion(
    messages: list[dict[str, Any]],
    model: str = TEXT_MODEL,
    temperature: float = 0.1,
    max_tokens: int = 1024,
    json_mode: bool = True,
    timeout_sec: float = 7.0,
) -> Optional[str]:
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
                return None
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except Exception:
        return None


async def vision_completion(
    image_url: str,
    prompt: str,
    model: str = VISION_MODEL,
    timeout_sec: float = 8.0,
) -> Optional[str]:
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

    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": 0.1,
        "max_tokens": 512,
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=timeout_sec) as client:
            resp = await client.post(GROQ_ENDPOINT, json=payload, headers=headers)
            if resp.status_code != 200:
                return None
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except Exception:
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
