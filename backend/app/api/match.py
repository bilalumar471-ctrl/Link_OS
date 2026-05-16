from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from app.agents.orchestrator import OrchestratorAgent

router = APIRouter()
orchestrator = OrchestratorAgent()

class MatchRunRequest(BaseModel):
    programme_id: str
    max_matches: int = 5

@router.post("/run")
async def run_matching(request: MatchRunRequest) -> List[str]:
    """
    Triggers the Orchestrator to broadcast criteria, evaluate mentors,
    and generate proposed Linkage records. Returns created Linkage IDs.
    """
    # Using the OrchestratorAgent which internally handles the logic
    # and concurrency.
    created_ids = await orchestrator.run_matching(request.programme_id)
    return created_ids
