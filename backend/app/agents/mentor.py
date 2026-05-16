import json
from typing import Dict, Any

from app.services import vertex_ai, gemini
from app.agents import prompts, schemas

class MentorAgent:
    """Evaluates how well a specific mentor fits a given company/programme's criteria."""
    
    async def evaluate_fit(
        self, 
        mentor_data: Dict[str, Any], 
        company_profile: Dict[str, Any], 
        criteria_embedding: list[float]
    ) -> schemas.FitScoreResponse:
        
        # Calculate base semantic similarity
        mentor_embedding = mentor_data.get("embedding_vector", [])
        if mentor_embedding and criteria_embedding:
            semantic_score = vertex_ai.compute_cosine_similarity(criteria_embedding, mentor_embedding)
        else:
            semantic_score = 0.5  # Neutral default if embeddings are missing
            
        # Prepare context for the prompt
        prompt = prompts.MENTOR_AGENT_PROMPT.format(
            mentor_profile=json.dumps(mentor_data.get("profile", {})),
            mentor_performance=json.dumps(mentor_data.get("performance", {})),
            mentor_history=json.dumps(mentor_data.get("history", [])),
        )
        
        # Add the company context and semantic score to the user message
        user_message = (
            f"Company Needs: {json.dumps(company_profile)}\n"
            f"Base Semantic Similarity Score: {semantic_score:.2f}\n"
            "Evaluate this mentor and return your JSON response."
        )
        
        full_prompt = f"{prompt}\n\n{user_message}"
        
        # Generate structured response via Gemini
        response: schemas.FitScoreResponse = await gemini.generate_structured_json(
            prompt=full_prompt,
            schema=schemas.FitScoreResponse,
            system_instruction="You are a strict, objective Mentor Evaluation Agent."
        )
        
        return response
