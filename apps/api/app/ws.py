"""
ws.py — WebSocket event broadcaster.
Clients connect to WS /ws/events and receive typed DomainEvent messages.
"""

import json
import asyncio
from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# In-memory subscriber set — fine for one-process demo
_subscribers: set[WebSocket] = set()


async def broadcast(kind: str, payload: Any) -> None:
    """Broadcast a typed event to all connected WebSocket clients."""
    import uuid
    from datetime import datetime, timezone

    message = json.dumps({
        "id": str(uuid.uuid4()),
        "ts": datetime.now(timezone.utc).isoformat(),
        "kind": kind,
        "payload": payload,
    })
    dead: list[WebSocket] = []
    for ws in _subscribers:
        try:
            await ws.send_text(message)
        except Exception:
            dead.append(ws)
    for ws in dead:
        _subscribers.discard(ws)


@router.websocket("/ws/events")
async def ws_events(websocket: WebSocket):
    await websocket.accept()
    _subscribers.add(websocket)
    try:
        # Keep alive — client may send pings
        while True:
            data = await websocket.receive_text()
            # Optionally handle pings or client messages here
    except WebSocketDisconnect:
        _subscribers.discard(websocket)
