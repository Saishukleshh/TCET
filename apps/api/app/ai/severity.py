"""
ai/severity.py — Severity classification.

Maps (risk_score, report_count, verified_depth, exposed_population) → AlertTier.
"""

from __future__ import annotations


def classify(
    risk: float,
    report_count: int,
    shows_flooding: bool,
    depth_estimate: str | None,
    population: int,
) -> str:
    """Return 'critical' | 'warning' | 'watch'."""
    score = risk

    # Boost for confirmed flooding
    if shows_flooding:
        depth_boost = {"waist+": 0.20, "knee": 0.12, "ankle": 0.06}.get(depth_estimate or "", 0.05)
        score += depth_boost

    # Boost for corroborating reports
    if report_count >= 10:
        score += 0.15
    elif report_count >= 5:
        score += 0.08
    elif report_count >= 2:
        score += 0.03

    # Boost for high exposed population
    if population > 50000:
        score += 0.10
    elif population > 20000:
        score += 0.05

    score = min(score, 1.0)

    if score >= 0.70:
        return "critical"
    if score >= 0.45:
        return "warning"
    return "watch"


def confidence_from_signals(
    image_result: dict | None,
    report_count: int,
    in_high_risk_zone: bool,
) -> tuple[float, str]:
    """
    Compute overall confidence and verification status.
    Returns (confidence: float 0-1, status: 'verified'|'probable'|'unverified').
    """
    score = 0.0

    # Image verification signal (weight: 0.50)
    if image_result:
        if image_result.get("shows_flooding"):
            score += 0.50 * image_result.get("confidence", 0.5)
        else:
            score += 0.0
    else:
        # No image — neutral
        score += 0.10

    # Corroboration (weight: 0.30)
    if report_count >= 10:
        score += 0.30
    elif report_count >= 5:
        score += 0.20
    elif report_count >= 2:
        score += 0.12
    else:
        score += 0.04

    # Location consistency (weight: 0.20)
    if in_high_risk_zone:
        score += 0.20

    score = min(score, 1.0)

    if score >= 0.70:
        status = "verified"
    elif score >= 0.40:
        status = "probable"
    else:
        status = "unverified"

    return round(score, 3), status
