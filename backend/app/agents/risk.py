import json
from typing import Dict, Any

from app.services import gemini
from app.agents import prompts, schemas

class RiskAgent:
    """Evaluates historical failure patterns to flag high-risk engagements."""
    
    async def evaluate_risk(
        self, 
        mentor_data: Dict[str, Any], 
        company_profile: Dict[str, Any]
    ) -> schemas.RiskAgentResponse:
        
        failure_patterns = mentor_data.get("performance", {}).get("failure_patterns", [])
        
        if not failure_patterns:
            # Short-circuit if there are no known failure patterns
            return schemas.RiskAgentResponse(
                risk_flags=[],
                risk_severity="none"
            )
            
        prompt = prompts.RISK_AGENT_PROMPT.format(
            failure_patterns=json.dumps(failure_patterns),
            company_profile=json.dumps(company_profile),
        )
        
        response: schemas.RiskAgentResponse = await gemini.generate_structured_json(
            prompt=prompt,
            schema=schemas.RiskAgentResponse,
            system_instruction="You are a Risk Analysis Agent. Be conservative and flag risks if patterns match."
        )
        
        return response
