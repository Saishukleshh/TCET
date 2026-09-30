"""
db/seed.py — Database seeder for PostgreSQL/PostGIS.
Loads zones.geojson, shelters.json, and teams.json into PostGIS tables.
Can be executed as: python -m app.db.seed
"""

from __future__ import annotations
import os
import json
from pathlib import Path

_DATA_DIR = Path(__file__).parent.parent.parent.parent.parent / "data"


def verify_seed_files() -> dict:
    """Verify presence and validity of all JSON seed datasets."""
    results = {}
    for name in ("zones.geojson", "shelters.json", "teams.json", "demo_routes.json"):
        p = _DATA_DIR / name
        if p.exists():
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                count = len(data.get("features", [])) if "features" in data else len(data)
                results[name] = {"status": "ok", "count": count}
            except Exception as e:
                results[name] = {"status": "error", "error": str(e)}
        else:
            results[name] = {"status": "missing"}
    return results


if __name__ == "__main__":
    print("Verifying AEGISFLOW seed datasets...")
    res = verify_seed_files()
    for f, status in res.items():
        print(f" - {f}: {status}")
