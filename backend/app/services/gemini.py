"""
Gemini 2.5 Flash Service Wrapper.

Uses the `google.genai` SDK to generate structured JSON responses
using Pydantic schemas.
"""

from google import genai
from google.genai import types
from typing import Type, Any, Optional
from pydantic import BaseModel

from app.config import settings


# Initialize the client once
client = genai.Client(api_key=settings.gemini_api_key)


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
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        temperature=temperature,
        max_output_tokens=settings.gemini_max_tokens,
        system_instruction=system_instruction,
    )

    response = await client.aio.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=config,
    )

    # Parse the returned JSON text directly into the requested schema
    return schema.model_validate_json(response.text)
