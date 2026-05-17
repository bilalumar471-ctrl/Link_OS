import asyncio
import json
import random
from datetime import datetime, timezone, timedelta

from app.services.firestore import get_firestore_client
from app.services.vertex_ai import get_embedding

# Setup
db = get_firestore_client()

# Data Collections
COLLECTIONS_TO_WIPE = ["entities/mentors/items", "entities/companies/items", "entities/programmes/items", "linkages", "sessions"]

PROGRAMMES = [
    {
        "id": "prog-fintech-2026",
        "data": {
            "name": "FinTech Innovators 2026",
            "description": "A 6-month accelerator for early-stage FinTech startups focusing on compliance, scaling, and market penetration.",
            "status": "active",
            "timeline": {
                "start_date": (datetime.now(timezone.utc) - timedelta(days=60)).isoformat(),
                "end_date": (datetime.now(timezone.utc) + timedelta(days=120)).isoformat()
            }
        }
    },
    {
        "id": "prog-greentech-scale",
        "data": {
            "name": "GreenTech Scale-up",
            "description": "Supporting climate-tech and green energy startups with supply chain optimization and enterprise partnerships.",
            "status": "active",
            "timeline": {
                "start_date": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
                "end_date": (datetime.now(timezone.utc) + timedelta(days=150)).isoformat()
            }
        }
    }
]

MENTORS = [
    {
        "id": "mentor-sarah-chen",
        "profile": {
            "name": "Sarah Chen",
            "expertise": ["FinTech", "Scaling", "Compliance", "Series A"],
            "experience_years": 15,
            "background": "Ex-Stripe VP of Engineering. Scaled multiple payment platforms. Deep understanding of regulatory compliance in APAC.",
            "personality_traits": ["Direct", "Results-oriented", "Structured"]
        }
    },
    {
        "id": "mentor-david-oconnor",
        "profile": {
            "name": "David O'Connor",
            "expertise": ["GreenTech", "Hardware", "Supply Chain", "Manufacturing"],
            "experience_years": 20,
            "background": "Former COO of a major solar panel manufacturer. Specializes in optimizing hardware supply chains and reducing unit economics.",
            "personality_traits": ["Patient", "Analytical", "Process-driven"]
        }
    },
    {
        "id": "mentor-azri-hassan",
        "profile": {
            "name": "Azri Hassan",
            "expertise": ["B2B SaaS", "Go-to-Market", "Enterprise Sales"],
            "experience_years": 12,
            "background": "Serial entrepreneur with 2 successful B2B SaaS exits. Expert in building outbound sales teams and pricing strategies.",
            "personality_traits": ["Energetic", "Motivator", "High-pace"]
        }
    },
    {
        "id": "mentor-elena-rodriguez",
        "profile": {
            "name": "Elena Rodriguez",
            "expertise": ["AI/ML", "Product Management", "Growth"],
            "experience_years": 10,
            "background": "Former Lead PM at DeepMind. Focuses on taking AI prototypes and turning them into scalable, user-friendly products.",
            "personality_traits": ["Visionary", "Challenging", "Empathetic"]
        }
    },
    {
        "id": "mentor-james-lee",
        "profile": {
            "name": "Dr. James Lee",
            "expertise": ["DeepTech", "Quantum Computing", "Patents", "R&D"],
            "experience_years": 25,
            "background": "Former Head of Research at IBM Quantum. Holds 40+ patents. Helps deep-tech founders commercialize research.",
            "personality_traits": ["Academic", "Methodical", "Deep-thinker"]
        }
    },
    {
        "id": "mentor-maya-sharma",
        "profile": {
            "name": "Maya Sharma",
            "expertise": ["MedTech", "FDA Approval", "Clinical Trials"],
            "experience_years": 18,
            "background": "Founded and sold a MedTech startup for $150M. Expert in navigating complex FDA regulatory pathways and designing clinical trials.",
            "personality_traits": ["Detail-oriented", "Resilient", "Supportive"]
        }
    }
]

COMPANIES = [
    {
        "id": "company-payflow",
        "profile": {
            "name": "PayFlow",
            "industry": "FinTech",
            "stage": "Seed",
            "team_size": 12,
            "challenges": ["Struggling to navigate local payment regulations", "Need to scale backend infrastructure to handle 10x volume"],
            "goals": ["Achieve SOC2 compliance", "Raise Series A in 6 months"]
        }
    },
    {
        "id": "company-ecogrid",
        "profile": {
            "name": "EcoGrid",
            "industry": "GreenTech",
            "stage": "Series A",
            "team_size": 35,
            "challenges": ["Supply chain bottlenecks for custom battery components", "High manufacturing defect rate"],
            "goals": ["Reduce unit cost by 20%", "Secure 2 enterprise pilots"]
        }
    },
    {
        "id": "company-saasify",
        "profile": {
            "name": "SaaSify",
            "industry": "B2B SaaS",
            "stage": "Pre-Seed",
            "team_size": 5,
            "challenges": ["No clear go-to-market strategy", "Relying heavily on founder-led sales"],
            "goals": ["Hire first AE", "Build a repeatable outbound engine"]
        }
    },
    {
        "id": "company-dataco",
        "profile": {
            "name": "DataCo KL",
            "industry": "AI/ML",
            "stage": "Seed",
            "team_size": 8,
            "challenges": ["Great tech but poor user retention", "Unclear product-market fit"],
            "goals": ["Launch V2 of platform", "Achieve 40% MAU retention"]
        }
    }
]


async def wipe_data():
    print("Wiping old demonstrative data...")
    for coll_name in COLLECTIONS_TO_WIPE:
        docs = db.collection(coll_name).stream()
        count = 0
        async for doc in docs:
            await doc.reference.delete()
            count += 1
        print(f" - Deleted {count} documents from '{coll_name}'")


async def seed_data():
    print("\nSeeding new realistic data...")

    # 1. Programmes
    for p in PROGRAMMES:
        await db.collection("entities/programmes/items").document(p["id"]).set(p["data"])
    print(f" - Seeded {len(PROGRAMMES)} programmes")

    # 2. Mentors
    for m in MENTORS:
        # Generate embedding
        profile_text = json.dumps(m["profile"])
        embedding = await get_embedding(profile_text)
        
        doc_data = {
            "profile": m["profile"],
            "embedding_vector": embedding,
            "performance": {"average_rating": 4.5 + (random.random() * 0.5), "matches_count": 0},
            "history": []
        }
        await db.collection("entities/mentors/items").document(m["id"]).set(doc_data)
        print(f"   > Seeded mentor: {m['profile']['name']}")

    # 3. Companies
    for c in COMPANIES:
        profile_text = json.dumps(c["profile"])
        embedding = await get_embedding(profile_text)
        
        doc_data = {
            "profile": c["profile"],
            "embedding_vector": embedding,
            "performance": {},
            "history": []
        }
        await db.collection("entities/companies/items").document(c["id"]).set(doc_data)
        print(f"   > Seeded company: {c['profile']['name']}")

    # 4. Linkages (Demonstrative matches with telemetry)
    linkages = [
        {
            "id": "linkage-payflow-sarah",
            "programme_id": "prog-fintech-2026",
            "mentor_id": "mentor-sarah-chen",
            "company_id": "company-payflow",
            "status": "active",
            "fit_score": 0.92,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat(),
            "trajectory": {
                "status": "stable",
                "trend_score": 0.5,
                "confidence": 0.85,
                "flags": [],
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        },
        {
            "id": "linkage-ecogrid-david",
            "programme_id": "prog-greentech-scale",
            "mentor_id": "mentor-david-oconnor",
            "company_id": "company-ecogrid",
            "status": "active",
            "fit_score": 0.88,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat(),
            "trajectory": {
                "status": "improving",
                "trend_score": 0.8,
                "confidence": 0.90,
                "flags": ["Milestone achieved ahead of schedule"],
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        },
        {
            "id": "linkage-saasify-azri",
            "programme_id": "prog-fintech-2026",
            "mentor_id": "mentor-azri-hassan",
            "company_id": "company-saasify",
            "status": "completed",
            "fit_score": 0.85,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=60)).isoformat(),
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "trajectory": {
                "status": "stable",
                "trend_score": 0.6,
                "confidence": 0.95,
                "flags": [],
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        },
        {
            "id": "linkage-dataco-elena",
            "programme_id": "prog-fintech-2026",
            "mentor_id": "mentor-elena-rodriguez",
            "company_id": "company-dataco",
            "status": "active",
            "fit_score": 0.76,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=40)).isoformat(),
            "trajectory": {
                "status": "declining",
                "trend_score": -0.85,
                "confidence": 0.92,
                "drop_probability": 0.77,
                "flags": ["Missed 3 consecutive sessions", "Critical misalignment on vision", "Radio silence"],
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        },
        {
            "id": "linkage-payflow-azri",
            "programme_id": "prog-fintech-2026",
            "mentor_id": "mentor-azri-hassan",
            "company_id": "company-payflow",
            "status": "proposed",
            "fit_score": 0.94,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "trajectory": None
        },
        {
            "id": "linkage-ecogrid-james",
            "programme_id": "prog-greentech-scale",
            "mentor_id": "mentor-james-lee",
            "company_id": "company-ecogrid",
            "status": "proposed",
            "fit_score": 0.89,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "trajectory": None
        },
        {
            "id": "linkage-dataco-maya",
            "programme_id": "prog-fintech-2026",
            "mentor_id": "mentor-maya-sharma",
            "company_id": "company-dataco",
            "status": "proposed",
            "fit_score": 0.91,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "trajectory": None
        }
    ]

    for l in linkages:
        # Fetch snapshots for the linkage
        m_doc = await db.collection("entities/mentors/items").document(l["mentor_id"]).get()
        c_doc = await db.collection("entities/companies/items").document(l["company_id"]).get()
        
        l["entity_a"] = {
            "id": l["mentor_id"],
            "type": "mentor",
            "snapshot": m_doc.to_dict().get("profile", {}) if m_doc.exists else {}
        }
        l["entity_b"] = {
            "id": l["company_id"],
            "type": "company",
            "snapshot": c_doc.to_dict().get("profile", {}) if c_doc.exists else {}
        }
        
        await db.collection("linkages").document(l["id"]).set(l)
    print(f" - Seeded {len(linkages)} linkages")


async def run():
    await wipe_data()
    await seed_data()
    print("\nRealistic demonstrative data generated successfully!")

if __name__ == "__main__":
    asyncio.run(run())
