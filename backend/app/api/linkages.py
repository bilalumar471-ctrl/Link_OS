from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from typing import Optional

from app.services import dal
from app.models.linkages import SessionLogCreate
from app.agents.post_mortem import PostMortemEngine
from app.agents.evolution import EvolutionEngine
from app.agents.trajectory import TrajectoryPredictorAgent

router = APIRouter()

# Instantiate agents
pm_engine = PostMortemEngine()
evolution_engine = EvolutionEngine()
trajectory_agent = TrajectoryPredictorAgent()


@router.get("/")
async def get_linkages(
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None)
):
    """Fetch linkages with optional filtering."""
    filters = {}
    if status:
        filters["status"] = status
    if type:
        filters["type"] = type
        
    return await dal.list_linkages(filters=filters)


@router.get("/suggestions")
async def get_reuse_suggestions(programme_id: str = Query(...)):
    """
    F8 — Cross-Programme Relationship Reuse.
    Queries completed linkages with high fit scores that overlap 
    with the new programme's criteria, and suggests proven pairings.
    """
    programme = await dal.get_entity("programmes", programme_id)
    if not programme:
        raise HTTPException(status_code=404, detail="Programme not found")

    # Get all completed linkages with high scores
    completed = await dal.list_linkages(filters={"status": "completed"})

    # Filter for high-performing ones (fit_score >= 75)
    suggestions = []
    for link in completed:
        if link.get("fit_score", 0) >= 75:
            suggestions.append({
                "linkage_id": link.get("id"),
                "mentor": link.get("entity_a", {}).get("snapshot", {}),
                "company": link.get("entity_b", {}).get("snapshot", {}),
                "fit_score": link.get("fit_score"),
                "original_programme_id": link.get("programme_id"),
                "reasoning": link.get("reasoning", ""),
            })

    # Sort by fit score descending
    suggestions.sort(key=lambda x: x["fit_score"], reverse=True)
    return suggestions


@router.post("/{linkage_id}/confirm")
async def confirm_linkage(linkage_id: str):
    """Moves a proposed linkage to active state."""
    linkage = await dal.get_linkage(linkage_id)
    if not linkage:
        raise HTTPException(status_code=404, detail="Linkage not found")
        
    await dal.update_linkage(linkage_id, {"status": "active"})
    return {"status": "active"}


@router.post("/{linkage_id}/close")
async def close_linkage(linkage_id: str, background_tasks: BackgroundTasks, outcome: str = "completed"):
    """
    Closes a linkage. 
    If dropped, triggers post-mortem.
    Always triggers cross-cohort evolution engine.
    """
    linkage = await dal.get_linkage(linkage_id)
    if not linkage:
        raise HTTPException(status_code=404, detail="Linkage not found")
        
    await dal.update_linkage(linkage_id, {"status": outcome})
    
    if outcome in ["dropped", "reassigned"]:
        background_tasks.add_task(pm_engine.analyze, linkage_id)
        
    background_tasks.add_task(evolution_engine.forecast, linkage_id)
    
    return {"status": outcome, "message": "Engines triggered in background"}


@router.post("/{linkage_id}/log-session")
async def log_session(linkage_id: str, session: SessionLogCreate, background_tasks: BackgroundTasks):
    """
    Logs a session and triggers the Trajectory Predictor in the background.
    """
    session_id = await dal.add_session(linkage_id, session.model_dump())
    
    # Run trajectory predictor non-blocking
    background_tasks.add_task(trajectory_agent.predict, linkage_id)
    
    return {"status": "logged", "session_id": session_id}


@router.get("/{linkage_id}/trajectory")
async def get_trajectory(linkage_id: str):
    """Fetches the latest trajectory prediction."""
    linkage = await dal.get_linkage(linkage_id)
    if not linkage:
        raise HTTPException(status_code=404, detail="Linkage not found")
        
    return linkage.get("trajectory", {})
