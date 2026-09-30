-- AEGISFLOW PostGIS schema
-- Run: psql $DATABASE_URL -f schema.sql
-- Requires: CREATE EXTENSION postgis; (run once on the DB)

-- ── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Zones ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    geom            GEOMETRY(Polygon, 4326) NOT NULL,
    elevation_m     FLOAT NOT NULL DEFAULT 0,
    vulnerability   FLOAT NOT NULL DEFAULT 0 CHECK (vulnerability BETWEEN 0 AND 1),
    history_score   FLOAT NOT NULL DEFAULT 0 CHECK (history_score BETWEEN 0 AND 1),
    population      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS zones_geom_idx ON zones USING GIST (geom);

-- ── Rain readings ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rain_readings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom            GEOMETRY(Point, 4326) NOT NULL,
    intensity_mm_h  FLOAT NOT NULL,
    ts              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source          TEXT NOT NULL DEFAULT 'open-meteo'
);
CREATE INDEX IF NOT EXISTS rain_readings_geom_idx ON rain_readings USING GIST (geom);
CREATE INDEX IF NOT EXISTS rain_readings_ts_idx ON rain_readings (ts DESC);

-- ── Reports ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom            GEOMETRY(Point, 4326) NOT NULL,
    text            TEXT NOT NULL,
    image_url       TEXT,
    depth_hint      TEXT CHECK (depth_hint IN ('ankle', 'knee', 'waist+')),
    ts              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cluster_id      UUID,
    incident_id     UUID,
    verification    TEXT NOT NULL DEFAULT 'unverified'
                        CHECK (verification IN ('verified', 'probable', 'unverified')),
    confidence      FLOAT NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
    source          TEXT NOT NULL DEFAULT 'citizen'
);
CREATE INDEX IF NOT EXISTS reports_geom_idx ON reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS reports_ts_idx ON reports (ts DESC);
CREATE INDEX IF NOT EXISTS reports_cluster_idx ON reports (cluster_id);

-- ── Incidents ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom            GEOMETRY(Point, 4326) NOT NULL,
    severity        TEXT NOT NULL CHECK (severity IN ('watch', 'warning', 'critical')),
    status          TEXT NOT NULL DEFAULT 'unverified'
                        CHECK (status IN ('verified', 'probable', 'unverified')),
    confidence      FLOAT NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
    report_count    INTEGER NOT NULL DEFAULT 1,
    evidence        JSONB NOT NULL DEFAULT '{}',
    recommended_action TEXT NOT NULL DEFAULT '',
    assigned_team_id UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS incidents_geom_idx ON incidents USING GIST (geom);
CREATE INDEX IF NOT EXISTS incidents_severity_idx ON incidents (severity);
CREATE INDEX IF NOT EXISTS incidents_created_idx ON incidents (created_at DESC);

-- ── Blocked roads ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_roads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom            GEOMETRY(LineString, 4326) NOT NULL,
    reason          TEXT NOT NULL DEFAULT 'flooding',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    ts              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS blocked_roads_geom_idx ON blocked_roads USING GIST (geom);

-- ── Shelters ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shelters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom            GEOMETRY(Point, 4326) NOT NULL,
    name            TEXT NOT NULL,
    capacity        INTEGER NOT NULL,
    occupancy       INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'full', 'closed'))
);
CREATE INDEX IF NOT EXISTS shelters_geom_idx ON shelters USING GIST (geom);

-- ── Teams ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom            GEOMETRY(Point, 4326) NOT NULL,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'available'
                        CHECK (status IN ('available', 'assigned', 'en_route', 'deployed')),
    incident_id     UUID
);
CREATE INDEX IF NOT EXISTS teams_geom_idx ON teams USING GIST (geom);

-- ── Assignments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id     UUID NOT NULL REFERENCES incidents(id),
    team_id         UUID NOT NULL REFERENCES teams(id),
    route           GEOMETRY(LineString, 4326),
    eta_min         INTEGER NOT NULL DEFAULT 0,
    approved_by     TEXT
);

-- ── Alerts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier            TEXT NOT NULL CHECK (tier IN ('watch', 'warning', 'critical')),
    zone_id         UUID NOT NULL REFERENCES zones(id),
    message         TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'sent', 'rejected')),
    approved_by     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS alerts_status_idx ON alerts (status);
CREATE INDEX IF NOT EXISTS alerts_created_idx ON alerts (created_at DESC);

-- ── Events (timeline + outcome log) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ts              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    kind            TEXT NOT NULL,
    payload         JSONB NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts DESC);
CREATE INDEX IF NOT EXISTS events_kind_idx ON events (kind);
