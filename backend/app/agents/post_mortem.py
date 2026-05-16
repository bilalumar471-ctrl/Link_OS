import json
from datetime import datetime, timezone

from app.services import gemini, dal
from app.agents import prompts, schemas

class PostMortemEngine:
    """Extracts lessons and failure patterns from a dropped linkage."""
    
    async def analyze(self, linkage_id: str) -> schemas.PostMortemResponse | None:
        linkage = await dal.get_linkage(linkage_id)
        if not linkage:
            return None
            
        sessions = await dal.get_sessions(linkage_id)
        feedback = linkage.get("feedback", {})
        
        prompt = prompts.POST_MORTEM_ENGINE_PROMPT.format(
            sessions=json.dumps(sessions),
            feedback=json.dumps(feedback)
        )
        
        response: schemas.PostMortemResponse = await gemini.generate_structured_json(
            prompt=prompt,
            schema=schemas.PostMortemResponse,
            system_instruction="You are the Post-Mortem Engine. Extract blunt, actionable lessons from failure."
        )
        
        pm_data = response.model_dump()
        pm_data["analysed_at"] = datetime.now(timezone.utc)
        
        # Save to linkage
        await dal.update_linkage(linkage_id, {"post_mortem": pm_data})
        
        # Write failure patterns back to mentor
        mentor_id = linkage.get("entity_a", {}).get("id")
        mentor = await dal.get_entity("mentors", mentor_id)
        if mentor:
            performance = mentor.get("performance", {})
            current_patterns = set(performance.get("failure_patterns", []))
            for lesson in response.lessons:
                current_patterns.add(lesson)
            
            performance["failure_patterns"] = list(current_patterns)
            await dal.update_entity("mentors", mentor_id, {"performance": performance})
            
        return response
