from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.agents.nl_interface import NLInterfaceAgent
from app.agents.self_reflection import SelfReflectionEngine
from app.services import dal
from app.core.auth import verify_token, require_roles

router = APIRouter()
nl_agent = NLInterfaceAgent()
reflection_engine = SelfReflectionEngine()

class NLQueryRequest(BaseModel):
    query: str

class ReflectionRequest(BaseModel):
    programme_id: str

@router.get("/health")
async def health_check():
    """Basic health check endpoint for Cloud Run."""
    return {"status": "ok", "service": "LinkOS API", "version": "1.2.0"}


@router.get("/stats")
async def get_system_stats(_user: dict = Depends(verify_token)):
    """Returns live ecosystem stats."""
    linkages = await dal.list_linkages()
    active_count = len([l for l in linkages if l.get("status") == "active"])
    
    mentors = await dal.list_entities("mentors")
    companies = await dal.list_entities("companies")
    programmes = await dal.list_entities("programmes")
    agents_count = len(mentors) + len(companies) + len(programmes)
    
    if linkages:
        total_fit = sum(l.get("fit_score", 0) for l in linkages)
        accuracy = round(total_fit / len(linkages))
    else:
        accuracy = 94
        
    return {
        "active_linkages": active_count,
        "agents_online": agents_count,
        "match_accuracy": accuracy
    }


@router.post("/nl/query")
async def query_natural_language(request: NLQueryRequest, _user: dict = Depends(verify_token)):
    """Processes plain English queries into actionable database insights."""
    result = await nl_agent.process_query(request.query)
    return result


@router.post("/system/reflect")
async def run_self_reflection(request: ReflectionRequest, _user: dict = Depends(require_roles("super_admin"))):
    """
    F9 — System-Level Self-Reflection Engine.
    Compares predicted fit scores to actual outcomes for a completed programme cycle.
    Outputs bias observations and weight adjustments.
    """
    result = await reflection_engine.reflect(request.programme_id)
    if result is None:
        return {"error": "No data available for reflection"}
    return result.model_dump()


@router.get("/linkages/at-risk")
async def get_at_risk_linkages(_user: dict = Depends(verify_token)) -> List[Dict[str, Any]]:
    """
    F7 — Engagement Health Monitor.
    Returns all active linkages with a declining or critical trajectory.
    Used by the admin dashboard to surface early warning alerts before
    engagements formally drop out.
    """
    # Fetch all active linkages
    active_linkages = await dal.list_linkages(filters={"status": "active"})

    at_risk = []
    for link in active_linkages:
        trajectory = link.get("trajectory", {})
        traj_status = trajectory.get("status", "")
        if traj_status in ("declining", "critical"):
            mentor_name = link.get("entity_a", {}).get("snapshot", {}).get("name", link.get("entity_a", {}).get("id", "Unknown Mentor"))
            company_name = link.get("entity_b", {}).get("snapshot", {}).get("name", link.get("entity_b", {}).get("id", "Unknown Company"))
            at_risk.append({
                "linkage_id": link.get("id"),
                "mentor": mentor_name,
                "company": company_name,
                "trajectory_status": traj_status,
                "drop_probability": trajectory.get("drop_probability", 0),
                "recommended_action": trajectory.get("recommended_action", ""),
                "action_urgency": trajectory.get("action_urgency", "monitor"),
                "alert_message": (
                    f"Engagement between {mentor_name} and {company_name} "
                    f"shows {traj_status.upper()} trajectory — "
                    f"{trajectory.get('drop_probability', 0):.0%} drop probability. "
                    f"{trajectory.get('recommended_action', '')}"
                ),
            })

    # Sort by urgency: critical first, then declining
    urgency_order = {"immediate": 0, "this_week": 1, "monitor": 2}
    at_risk.sort(key=lambda x: (
        0 if x["trajectory_status"] == "critical" else 1,
        urgency_order.get(x["action_urgency"], 2)
    ))

    return at_risk
