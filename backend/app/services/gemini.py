"""
Gemini 2.0 Flash Service Wrapper.

Configures the google.generativeai SDK and provides an async helper
to generate structured JSON responses using Pydantic schemas.
"""

import google.generativeai as genai
from typing import Type, Any, Optional, Dict
from pydantic import BaseModel

from app.config import settings


# Configure the SDK once
genai.configure(api_key=settings.gemini_api_key)


async def generate_structured_json(
    prompt: str,
    schema: Type[BaseModel],
    system_instruction: Optional[str] = None,
    temperature: float = 0.2,
) -> Any:
    """
    Calls Gemini 2.0 Flash and forces the output to match the provided Pydantic schema.
    Returns a parsed instance of the Pydantic schema.
    """
    # In newer google-generativeai SDK versions, you can pass Pydantic models directly 
    # to the `response_schema` generation config field.
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        system_instruction=system_instruction
    )
    
    config = genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=schema,
        temperature=temperature,
        max_output_tokens=settings.gemini_max_tokens,
    )
    
    response = await model.generate_content_async(
        contents=prompt,
        generation_config=config,
    )
    
    # Parse the returned JSON text directly into the requested schema
    return schema.model_validate_json(response.text)
