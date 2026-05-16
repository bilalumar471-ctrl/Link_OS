from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.nl_interface import NLInterfaceAgent

router = APIRouter()
nl_agent = NLInterfaceAgent()

class NLQueryRequest(BaseModel):
    query: str

@router.get("/health")
async def health_check():
    """Basic health check endpoint for Cloud Run."""
    return {"status": "ok", "service": "LinkOS API"}

@router.post("/nl/query")
async def query_natural_language(request: NLQueryRequest):
    """Processes plain English queries into actionable database insights."""
    result = await nl_agent.process_query(request.query)
    return result
