import json
from datetime import datetime, timezone

from app.services import gemini, dal
from app.agents import prompts, schemas

class EvolutionEngine:
    """Predicts how mentor-company fit will change across future cohorts."""
    
    async def forecast(self, linkage_id: str) -> schemas.EvolutionForecastResponse | None:
        linkage = await dal.get_linkage(linkage_id)
        if not linkage:
            return None
            
        mentor_id = linkage.get("entity_a", {}).get("id")
        company_id = linkage.get("entity_b", {}).get("id")
        
        mentor_history = await dal.get_entity_history("mentors", mentor_id)
        company_history = await dal.get_entity_history("companies", company_id)
        
        prompt = prompts.EVOLUTION_ENGINE_PROMPT.format(
            current_fit_score=linkage.get("fit_score", 0),
            company_history=json.dumps(company_history),
            mentor_history=json.dumps(mentor_history),
        )
        
        response: schemas.EvolutionForecastResponse = await gemini.generate_structured_json(
            prompt=prompt,
            schema=schemas.EvolutionForecastResponse,
            system_instruction="You are a strategic Cross-Cohort Evolution Engine. Project growth trajectories to see if the mentor's domain will still match the company's future needs."
        )
        
        # Save to linkage
        forecast_data = response.model_dump()
        forecast_data["forecast_generated_at"] = datetime.now(timezone.utc)
        
        await dal.update_linkage(linkage_id, {"evolution_forecast": forecast_data})
        
        return response
