"""
seed_firestore.py — Seeds Firestore with demo data for LinkOS.

Pre-seeds:
  • 6 mentors
  • 4 companies
  • 2 programmes

Run:  python scripts/seed_firestore.py
"""

import asyncio
import sys
import os

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.firestore import get_firestore_client  # noqa: E402
from app.services import dal  # noqa: E402

# ───────────────────────────────────────────
# Mentor seed data
# ───────────────────────────────────────────

MENTORS = [
    {
        "profile": {
            "name": "Azri Hassan",
            "expertise": ["fintech", "payments", "revenue growth"],
            "sectors": ["Fintech"],
            "region": "KL",
            "stage_pref": "Series A",
            "bio": "15-year fintech veteran. Former CTO of a leading MY payments startup.",
        },
        "performance": {
            "avg_rating": 4.3,
            "completion_rate": 0.92,
            "session_attendance": 0.95,
            "domain_match_score": 0.88,
            "total_engagements": 12,
            "strength_tags": ["fintech", "payments", "GTM strategy"],
            "weakness_tags": [],
            "failure_patterns": [],
        },
    },
    {
        "profile": {
            "name": "Priya Nair",
            "expertise": ["edtech", "product management", "UX design"],
            "sectors": ["EdTech"],
            "region": "KL",
            "stage_pref": "Seed",
            "bio": "Product leader with 10 years in EdTech SaaS across SEA.",
        },
        "performance": {
            "avg_rating": 4.6,
            "completion_rate": 0.95,
            "session_attendance": 0.98,
            "domain_match_score": 0.91,
            "total_engagements": 8,
            "strength_tags": ["edtech", "product design", "user research"],
            "weakness_tags": [],
            "failure_patterns": [],
        },
    },
    {
        "profile": {
            "name": "Lim Wei",
            "expertise": ["hardware", "IoT", "supply chain"],
            "sectors": ["DeepTech", "IoT"],
            "region": "Penang",
            "stage_pref": "Pre-seed",
            "bio": "Hardware engineer turned startup advisor. 3 exits in IoT space.",
        },
        "performance": {
            "avg_rating": 3.4,
            "completion_rate": 0.67,
            "session_attendance": 0.72,
            "domain_match_score": 0.65,
            "total_engagements": 6,
            "strength_tags": ["hardware prototyping"],
            "weakness_tags": ["pre-seed mentoring", "remote engagement"],
            "failure_patterns": [
                "Consistently lower ratings after session 3 in pre-seed engagements",
                "Dropped 2 of 3 pre-seed engagements before completion",
            ],
        },
    },
    {
        "profile": {
            "name": "Sarah Tan",
            "expertise": ["healthtech", "regulatory affairs", "clinical trials"],
            "sectors": ["HealthTech"],
            "region": "Singapore",
            "stage_pref": "Series A",
            "bio": "Former pharma exec, now advises digital health startups on regulatory pathways.",
        },
        "performance": {
            "avg_rating": 4.1,
            "completion_rate": 0.88,
            "session_attendance": 0.90,
            "domain_match_score": 0.85,
            "total_engagements": 9,
            "strength_tags": ["regulatory", "healthtech", "clinical"],
            "weakness_tags": ["early-stage companies"],
            "failure_patterns": [],
        },
    },
    {
        "profile": {
            "name": "Raj Kumar",
            "expertise": ["AI/ML", "data engineering", "cloud infrastructure"],
            "sectors": ["AI", "SaaS"],
            "region": "KL",
            "stage_pref": "Seed",
            "bio": "Google Cloud champion. Built ML pipelines at scale for two unicorns.",
        },
        "performance": {
            "avg_rating": 4.5,
            "completion_rate": 0.93,
            "session_attendance": 0.96,
            "domain_match_score": 0.90,
            "total_engagements": 11,
            "strength_tags": ["AI/ML", "cloud architecture", "data pipelines"],
            "weakness_tags": [],
            "failure_patterns": [],
        },
    },
    {
        "profile": {
            "name": "Aisha Mohammed",
            "expertise": ["sustainability", "ESG reporting", "impact investing"],
            "sectors": ["CleanTech", "Impact"],
            "region": "KL",
            "stage_pref": "Pre-seed",
            "bio": "Impact investor and sustainability consultant for SEA startups.",
        },
        "performance": {
            "avg_rating": 4.0,
            "completion_rate": 0.85,
            "session_attendance": 0.88,
            "domain_match_score": 0.80,
            "total_engagements": 7,
            "strength_tags": ["ESG", "impact measurement", "fundraising"],
            "weakness_tags": ["technical deep-dives"],
            "failure_patterns": [],
        },
    },
]

# ───────────────────────────────────────────
# Company seed data
# ───────────────────────────────────────────

COMPANIES = [
    {
        "profile": {
            "name": "TechVenture MY",
            "stage": "Series A",
            "sector": "Fintech",
            "needs": ["GTM strategy", "payment rails", "revenue scaling"],
            "region": "KL",
            "founding_year": 2021,
        },
        "performance": {
            "responsiveness_score": 0.92,
            "follow_through_rate": 0.88,
            "avg_mentor_rating_given": 4.2,
        },
    },
    {
        "profile": {
            "name": "DataCo KL",
            "stage": "Pre-seed",
            "sector": "AI",
            "needs": ["data pipeline design", "cloud architecture", "first hire strategy"],
            "region": "KL",
            "founding_year": 2024,
        },
        "performance": {
            "responsiveness_score": 0.78,
            "follow_through_rate": 0.70,
            "avg_mentor_rating_given": 3.5,
        },
    },
    {
        "profile": {
            "name": "EduSpark",
            "stage": "Seed",
            "sector": "EdTech",
            "needs": ["product-market fit", "UX improvement", "B2B sales"],
            "region": "Johor",
            "founding_year": 2023,
        },
        "performance": {
            "responsiveness_score": 0.85,
            "follow_through_rate": 0.82,
            "avg_mentor_rating_given": 4.0,
        },
    },
    {
        "profile": {
            "name": "GreenPulse",
            "stage": "Pre-seed",
            "sector": "CleanTech",
            "needs": ["impact measurement", "ESG compliance", "seed fundraising"],
            "region": "KL",
            "founding_year": 2025,
        },
        "performance": {
            "responsiveness_score": 0.90,
            "follow_through_rate": 0.85,
            "avg_mentor_rating_given": 4.1,
        },
    },
]

# ───────────────────────────────────────────
# Programme seed data
# ───────────────────────────────────────────

PROGRAMMES = [
    {
        "profile": {
            "name": "MyHack Fintech Cohort 3",
            "criteria": {
                "sector_focus": ["Fintech"],
                "stage_required": "Series A",
                "region": "KL",
                "expertise_needed": ["payments", "revenue growth", "GTM strategy"],
            },
            "cohort_size": 5,
            "sector_focus": ["Fintech"],
            "region": "KL",
            "start_date": "2026-06-01T00:00:00Z",
        },
        "active_linkages": [],
    },
    {
        "profile": {
            "name": "SEA Impact Accelerator 2026",
            "criteria": {
                "sector_focus": ["CleanTech", "Impact", "EdTech"],
                "stage_required": "Pre-seed",
                "region": "KL",
                "expertise_needed": ["impact investing", "ESG", "product design"],
            },
            "cohort_size": 8,
            "sector_focus": ["CleanTech", "Impact", "EdTech"],
            "region": "KL",
            "start_date": "2026-07-01T00:00:00Z",
        },
        "active_linkages": [],
    },
]


async def main():
    print("🌱 Seeding Firestore with demo data...\n")

    # Seed mentors
    print("── Mentors ──")
    mentor_ids = []
    for m in MENTORS:
        mid = await dal.create_entity("mentors", m)
        mentor_ids.append(mid)
        print(f"  ✓ {m['profile']['name']}  →  {mid}")

    # Seed companies
    print("\n── Companies ──")
    company_ids = []
    for c in COMPANIES:
        cid = await dal.create_entity("companies", c)
        company_ids.append(cid)
        print(f"  ✓ {c['profile']['name']}  →  {cid}")

    # Seed programmes
    print("\n── Programmes ──")
    programme_ids = []
    for p in PROGRAMMES:
        pid = await dal.create_entity("programmes", p)
        programme_ids.append(pid)
        print(f"  ✓ {p['profile']['name']}  →  {pid}")

    # Create 2 pre-seeded active linkages for trajectory demo
    print("\n── Active Linkages (for trajectory demo) ──")

    # Linkage 1: Azri Hassan ↔ TechVenture MY  (healthy engagement)
    link1_data = {
        "type": "mentor_company",
        "entity_a": {"id": mentor_ids[0], "type": "mentor", "snapshot": MENTORS[0]["profile"]},
        "entity_b": {"id": company_ids[0], "type": "company", "snapshot": COMPANIES[0]["profile"]},
        "status": "active",
        "fit_score": 91,
        "reasoning": "Strong semantic and historical match. No failure flags. Mentor has 3 successful fintech engagements.",
        "risk_flags": [],
        "confidence": "high",
        "created_by": "orchestrator_agent",
        "programme_id": programme_ids[0],
    }
    lid1 = await dal.create_linkage(link1_data)
    print(f"  ✓ Azri Hassan ↔ TechVenture MY  →  {lid1}")

    # Linkage 2: Lim Wei ↔ DataCo KL  (declining engagement for demo)
    link2_data = {
        "type": "mentor_company",
        "entity_a": {"id": mentor_ids[2], "type": "mentor", "snapshot": MENTORS[2]["profile"]},
        "entity_b": {"id": company_ids[1], "type": "company", "snapshot": COMPANIES[1]["profile"]},
        "status": "active",
        "fit_score": 77,
        "reasoning": "Moderate semantic match. Mentor has IoT experience relevant to data pipelines but 2 prior pre-seed drops flagged.",
        "risk_flags": ["Mentor has dropped 2 of 3 pre-seed engagements"],
        "confidence": "medium",
        "created_by": "orchestrator_agent",
        "programme_id": programme_ids[0],
    }
    lid2 = await dal.create_linkage(link2_data)
    print(f"  ✓ Lim Wei ↔ DataCo KL  →  {lid2}")

    print(f"\n✅ Seeding complete!  Mentor IDs: {mentor_ids}")
    print(f"   Company IDs: {company_ids}")
    print(f"   Programme IDs: {programme_ids}")
    print(f"   Linkage IDs: [{lid1}, {lid2}]")


if __name__ == "__main__":
    asyncio.run(main())
