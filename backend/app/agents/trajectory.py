import json
from typing import Dict, Any

from app.services import gemini, dal
from app.agents import prompts, schemas

class TrajectoryPredictorAgent:
    """Predicts engagement dropout probability based on session logs."""
    
    async def predict(self, linkage_id: str) -> schemas.TrajectoryPredictionResponse | None:
        linkage = await dal.get_linkage(linkage_id)
        if not linkage:
            return None
            
        sessions = await dal.get_sessions(linkage_id)
        if len(sessions) < 2:
            return None  # Need at least 2 sessions to form a trend
            
        mentor_id = linkage.get("entity_a", {}).get("id")
        mentor = await dal.get_entity("mentors", mentor_id)
        if not mentor:
            return None
            
        company_snapshot = linkage.get("entity_b", {}).get("snapshot", {})
        
        prompt = prompts.TRAJECTORY_PREDICTOR_PROMPT.format(
            mentor_profile=json.dumps(mentor.get("profile", {})),
            mentor_failure_patterns=json.dumps(mentor.get("performance", {}).get("failure_patterns", [])),
            company_profile=json.dumps(company_snapshot),
            sessions=json.dumps(sessions),
            total_planned_sessions=10  # Assuming 10 for MVP
        )
        
        response: schemas.TrajectoryPredictionResponse = await gemini.generate_structured_json(
            prompt=prompt,
            schema=schemas.TrajectoryPredictionResponse,
            system_instruction="You are a highly analytical Relationship Trajectory Predictor. Pay attention to declining ratings or slow response times."
        )
        
        # Save to linkage
        from datetime import datetime, timezone
        prediction_data = response.model_dump()
        prediction_data["last_computed_at"] = datetime.now(timezone.utc)
        
        await dal.update_linkage(linkage_id, {"trajectory": prediction_data})
        
        # Push alert to admin dashboard feed if declining or critical (PRD F11)
        if response.status in ["declining", "critical"]:
            from app.services.stream import streamer
            await streamer.publish(
                "TrajectoryPredictor",
                f"⚠️ ALERT: Linkage {linkage_id} trajectory is {response.status.upper()}. "
                f"Drop probability: {response.drop_probability:.0%}. "
                f"Action: {response.recommended_action}"
            )
        
        return response
