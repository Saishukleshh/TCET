"""
AEGISFLOW API — main.py
FastAPI application entry point.
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import reports, incidents, risk, routing, allocate, alerts, simulate, chat
from app.ws import router as ws_router, broadcast


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start weather polling in background
    from app.services.weather import poller
    task = asyncio.create_task(poller(broadcast))
    yield
    task.cancel()


app = FastAPI(
    title="AEGISFLOW API",
    version="0.1.0",
    description="Intelligent Disaster Management & Urban Flood Prediction",
    lifespan=lifespan,
)

import os

cors_origins_env = os.getenv("CORS_ORIGINS", "")
if cors_origins_env.strip():
    allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes
app.include_router(reports.router,   prefix="/reports",   tags=["reports"])
app.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
app.include_router(risk.router,      prefix="/risk",      tags=["risk"])
app.include_router(routing.router,   prefix="/routes",    tags=["routing"])
app.include_router(allocate.router,  prefix="/allocate",  tags=["allocate"])
app.include_router(alerts.router,    prefix="/alerts",    tags=["alerts"])
app.include_router(simulate.router,  prefix="/simulate",  tags=["simulate"])
app.include_router(chat.router,      prefix="/chat",      tags=["chat"])

# WebSocket
app.include_router(ws_router)


# ── Extra convenience endpoints ───────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "aegisflow-api"}


@app.get("/events")
async def get_events():
    from app.db import store
    return list(reversed(store.events[-100:]))  # last 100 events


@app.get("/resources/shelters")
async def get_shelters():
    from app.db import store
    return store.shelters


@app.get("/resources/teams")
async def get_teams():
    from app.db import store
    return store.teams
