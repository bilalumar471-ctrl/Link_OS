from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any

from app.agents.orchestrator import OrchestratorAgent
from app.services import dal
from app.core.auth import require_roles

router = APIRouter()
orchestrator = OrchestratorAgent()

class MatchRunRequest(BaseModel):
    programme_id: str
    max_matches: int = 5

@router.post("/run")
async def run_matching(request: MatchRunRequest, _user: dict = Depends(require_roles("super_admin", "programme_admin"))) -> Dict[str, Any]:
    """
    Triggers the Orchestrator to broadcast criteria, evaluate mentors,
    and generate proposed Linkage records. Returns detailed matches.
    """
    try:
        created_ids = await orchestrator.run_matching(request.programme_id)
        
        matches = []
        for lid in created_ids:
            link = await dal.get_linkage(lid)
            if link:
                matches.append({
                    "linkage_id": lid,
                    "mentor_id": link["entity_a"]["id"],
                    "mentor_name": link["entity_a"]["snapshot"].get("name", "Unknown Mentor"),
                    "company_id": link["entity_b"]["id"],
                    "company_name": link["entity_b"]["snapshot"].get("name", "Unknown Company"),
                    "fit_score": link.get("fit_score", 0)
                })
                
        return {"matches": matches}
    except Exception as e:
        import traceback
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=400, content={"detail": f"{type(e).__name__}: {str(e)}", "traceback": traceback.format_exc()})
