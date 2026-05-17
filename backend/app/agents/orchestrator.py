import asyncio
import json
from typing import List, Dict, Any
from datetime import datetime, timezone

from app.services import dal, vertex_ai
from app.services.stream import streamer
from app.agents.mentor import MentorAgent
from app.agents.risk import RiskAgent
from app.models.linkages import LinkageCreate, EntitySnapshot

class OrchestratorAgent:
    """Coordinates the matching process across multiple mentors and creates linkages."""
    
    def __init__(self):
        self.mentor_agent = MentorAgent()
        self.risk_agent = RiskAgent()
        
    async def run_matching(self, programme_id: str) -> List[str]:
        # 1. Fetch Programme
        programme = await dal.get_entity("programmes", programme_id)
        if not programme:
            raise ValueError(f"Programme {programme_id} not found")
            
        # 2. For demo purposes, we will try to match ALL companies in the DB against ALL mentors.
        # In a real scenario, you'd pick a specific company or run a queue.
        # Here we just run one company against all mentors for the given programme.
        companies = await dal.list_entities("companies", limit=1)
        if not companies:
            return []
        
        company = companies[0]
        company_profile = company.get("profile", {})
        
        # 3. Create semantic embedding of the criteria (company needs + programme focus)
        criteria_text = json.dumps({
            "company_challenges": company_profile.get("challenges", []),
            "company_goals": company_profile.get("goals", []),
            "programme_focus": programme.get("description", "")
        })
        criteria_embedding = await vertex_ai.get_embedding(criteria_text)
        
        await streamer.publish("OrchestratorAgent", f"Starting match cycle for programme {programme_id}. Picked company {company['id']}.")
        
        # 4. Broadcast to all Mentor Agents
        mentors = await dal.list_entities("mentors")
        await streamer.publish("OrchestratorAgent", f"Broadcasting criteria to {len(mentors)} Mentor Agents...")
        
        tasks = []
        for mentor in mentors:
            tasks.append(self._evaluate_single_mentor(mentor, company, programme_id, criteria_embedding))
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 5. Filter valid responses and rank
        valid_matches = [r for r in results if isinstance(r, dict)]
        ranked_matches = sorted(valid_matches, key=lambda x: x["fit_score"], reverse=True)
        
        # 6. Take top N (e.g. top 3) and create proposed linkages
        created_linkage_ids = []
        for match in ranked_matches[:3]:
            linkage_payload = LinkageCreate(
                type="mentor_company",
                entity_a=EntitySnapshot(id=match["mentor_id"], type="mentor", snapshot=match["mentor_snapshot"]),
                entity_b=EntitySnapshot(id=company["id"], type="company", snapshot=company_profile),
                fit_score=match["fit_score"],
                reasoning=match["reasoning"],
                risk_flags=match["risk_flags"],
                confidence=match["confidence"],
                programme_id=programme_id
            )
            
            lid = await dal.create_linkage(linkage_payload.model_dump())
            created_linkage_ids.append(lid)
            
        return created_linkage_ids
        
    async def _evaluate_single_mentor(
        self, 
        mentor: Dict[str, Any], 
        company: Dict[str, Any], 
        programme_id: str, 
        criteria_embedding: list[float]
    ) -> Dict[str, Any]:
        """Runs the MentorAgent and RiskAgent concurrently for a single mentor."""
        
        company_profile = company.get("profile", {})
        
        # Run both agents concurrently
        await streamer.publish("MentorAgent", f"Evaluating fit for {mentor['id']}...")
        fit_task = self.mentor_agent.evaluate_fit(mentor, company_profile, criteria_embedding)
        
        await streamer.publish("RiskAgent", f"Scanning failure patterns for {mentor['id']}...")
        risk_task = self.risk_agent.evaluate_risk(mentor, company_profile)
        
        fit_res, risk_res = await asyncio.gather(fit_task, risk_task)
        
        await streamer.publish("OrchestratorAgent", f"Received responses for {mentor['id']}: Fit {fit_res.fit_score}, Risk {risk_res.risk_severity}")
        
        # Aggregate the output
        return {
            "mentor_id": mentor["id"],
            "mentor_snapshot": mentor.get("profile", {}),
            "fit_score": fit_res.fit_score,
            "reasoning": fit_res.reasoning,
            "confidence": fit_res.confidence,
            "risk_flags": risk_res.risk_flags,
            "risk_severity": risk_res.risk_severity
        }
