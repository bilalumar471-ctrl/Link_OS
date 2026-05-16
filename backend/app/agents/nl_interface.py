from typing import Dict, Any, List
from pydantic import BaseModel, Field

from app.services import gemini, dal

class NLQueryResponse(BaseModel):
    interpreted_intent: str = Field(..., description="Summary of what the user is asking for")
    target_collection: str = Field(..., description="Collection to query: mentors, companies, programmes, or linkages")
    result_summary: str = Field(..., description="A natural language summary answering the user's query based on the fetched data")

class NLInterfaceAgent:
    """Interprets natural language queries, performs data fetches, and summarizes the results."""
    
    async def process_query(self, query: str) -> Dict[str, Any]:
        # Step 1: Broad fetch (For MVP, we just fetch all from a likely collection and let Gemini filter)
        # In a real system, you'd use a multi-step tool calling loop. Here we optimize for speed.
        
        prompt = (
            f"User query: '{query}'.\n"
            "Analyze the query to determine if they want 'mentors', 'companies', 'programmes', or 'linkages'.\n"
            "Return JSON matching the schema, but leave result_summary empty for now. We just need the collection."
        )
        
        class IntentSchema(BaseModel):
            target_collection: str = Field(description="mentors | companies | programmes | linkages")
            
        intent_response = await gemini.generate_structured_json(
            prompt=prompt,
            schema=IntentSchema,
            system_instruction="You are a routing agent."
        )
        
        col = intent_response.target_collection
        if col not in ["mentors", "companies", "programmes", "linkages"]:
            col = "mentors"
            
        # Step 2: Fetch data from DAL
        if col == "linkages":
            data = await dal.list_linkages(limit=20)
        else:
            data = await dal.list_entities(col, limit=20)
            
        # Step 3: Summarize
        summary_prompt = (
            f"User query: '{query}'\n"
            f"Data fetched from {col}:\n{data}\n"
            "Analyze the data and answer the user's query. Return the final result."
        )
        
        final_response: NLQueryResponse = await gemini.generate_structured_json(
            prompt=summary_prompt,
            schema=NLQueryResponse,
            system_instruction="You are a helpful admin assistant summarizing database records."
        )
        
        # Save query log
        await dal.save_nl_query({
            "raw_input": query,
            "interpreted_intent": final_response.interpreted_intent,
            "target_collection": final_response.target_collection,
            "result_summary": final_response.result_summary
        })
        
        return final_response.model_dump()
