"""
seed_sessions.py — Seeds session logs for the 2 pre-seeded active linkages.

Creates 3 sessions each:
  • Linkage 1 (Azri ↔ TechVenture): healthy / improving trajectory
  • Linkage 2 (Lim Wei ↔ DataCo): declining trajectory (ratings falling,
    response time increasing) — used to demonstrate the Trajectory Predictor.

Run:  python scripts/seed_sessions.py  (after seed_firestore.py)

IMPORTANT: You must pass the two linkage IDs that were printed by
           seed_firestore.py, e.g.:

    python scripts/seed_sessions.py <linkage_1_id> <linkage_2_id>
"""

import asyncio
import sys
import os
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services import dal  # noqa: E402


# ───────────────────────────────────────────
# Session data
# ───────────────────────────────────────────

def _ts(days_ago: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days_ago)


# Healthy engagement — ratings improving, response time low
SESSIONS_HEALTHY = [
    {
        "session_number": 1,
        "date": _ts(21),
        "attended": True,
        "rating": 4.0,
        "response_time_hours": 6.0,
        "notes": "Great kickoff session. Clear goal alignment.",
    },
    {
        "session_number": 2,
        "date": _ts(14),
        "attended": True,
        "rating": 4.3,
        "response_time_hours": 4.0,
        "notes": "Mentor provided detailed GTM framework. Company engaged.",
    },
    {
        "session_number": 3,
        "date": _ts(7),
        "attended": True,
        "rating": 4.5,
        "response_time_hours": 3.0,
        "notes": "Excellent progress. Revenue pilot plan finalised.",
    },
]

# Declining engagement — ratings falling, response time growing
SESSIONS_DECLINING = [
    {
        "session_number": 1,
        "date": _ts(21),
        "attended": True,
        "rating": 4.5,
        "response_time_hours": 12.0,
        "notes": "Good first session but mentor seemed unsure about AI scope.",
    },
    {
        "session_number": 2,
        "date": _ts(14),
        "attended": True,
        "rating": 3.8,
        "response_time_hours": 18.0,
        "notes": "Mentor struggled with cloud architecture questions. Delayed follow-up.",
    },
    {
        "session_number": 3,
        "date": _ts(7),
        "attended": True,
        "rating": 3.1,
        "response_time_hours": 31.0,
        "notes": "Significant domain mismatch becoming apparent. Company frustrated with slow responses.",
    },
]


async def main():
    if len(sys.argv) < 3:
        print("Usage: python scripts/seed_sessions.py <healthy_linkage_id> <declining_linkage_id>")
        print("\nThese IDs are printed at the end of seed_firestore.py output.")
        sys.exit(1)

    healthy_id = sys.argv[1]
    declining_id = sys.argv[2]

    print("🌱 Seeding session logs...\n")

    print(f"── Healthy engagement ({healthy_id}) ──")
    for s in SESSIONS_HEALTHY:
        sid = await dal.add_session(healthy_id, s)
        print(f"  ✓ Session {s['session_number']}  rating={s['rating']}  →  {sid}")

    print(f"\n── Declining engagement ({declining_id}) ──")
    for s in SESSIONS_DECLINING:
        sid = await dal.add_session(declining_id, s)
        print(f"  ✓ Session {s['session_number']}  rating={s['rating']}  response_time={s['response_time_hours']}h  →  {sid}")

    # Write a pre-computed declining trajectory to the linkage for immediate demo
    declining_trajectory = {
        "trajectory": {
            "status": "declining",
            "predicted_final_rating": 2.4,
            "predicted_outcome": "drop",
            "drop_probability": 0.78,
            "predicted_drop_week": 6,
            "confidence": "high",
            "trajectory_reason": (
                "Ratings fallen from 4.5 to 3.1 across 3 sessions with increasing "
                "response time (12h → 31h), matching pattern of 2 prior drops for this mentor."
            ),
            "recommended_action": (
                "Schedule admin check-in within 48 hours. "
                "Consider reassignment if next rating drops below 3.0."
            ),
            "action_urgency": "immediate",
            "last_computed_at": _ts(0),
        }
    }
    await dal.update_linkage(declining_id, declining_trajectory)
    print(f"\n  ⚠ Trajectory prediction written: DECLINING · 78% drop probability")

    print("\n✅ Session seeding complete!")


if __name__ == "__main__":
    asyncio.run(main())
