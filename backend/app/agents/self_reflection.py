"""
Self-Reflection Engine (F9) — System-Level Matching Accuracy Evaluation.

After a programme cycle closes, evaluates the platform's own matching accuracy
by comparing predicted fit scores to actual outcomes. Detects systematic bias
and outputs weight adjustments for future matching cycles.
"""

import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.services import gemini, dal
from app.agents import schemas


class SelfReflectionEngine:
    """Evaluates the platform's matching accuracy after a programme cycle closes."""

    async def reflect(self, programme_id: str) -> Optional[schemas.SelfReflectionResponse]:
        """
        Compare predicted fit scores to actual final ratings for all
        linkages in a completed programme cycle.
        """
        programme = await dal.get_entity("programmes", programme_id)
        if not programme:
            return None

        # Fetch all linkages for this programme
        linkages = await dal.list_linkages(filters={"programme_id": programme_id})
        if not linkages:
            return None

        # Build predicted vs actual comparison
        predicted_scores = {}
        actual_outcomes = {}
        for link in linkages:
            lid = link.get("id", "")
            predicted_scores[lid] = link.get("fit_score", 0)
            # Use feedback admin_rating as the actual outcome, fallback to 0
            feedback = link.get("feedback", {})
            actual_outcomes[lid] = feedback.get("admin_rating", 0)

        prompt = f"""
Analyse the matching accuracy of this programme cycle.

Programme: {json.dumps(programme.get("profile", {}))}

Predicted Fit Scores at Match Time:
{json.dumps(predicted_scores)}

Actual Final Ratings:
{json.dumps(actual_outcomes)}

Linkage Details:
{json.dumps([{
    "id": l.get("id"),
    "mentor": l.get("entity_a", {}).get("snapshot", {}).get("name", ""),
    "company": l.get("entity_b", {}).get("snapshot", {}).get("name", ""),
    "fit_score": l.get("fit_score"),
    "status": l.get("status"),
    "risk_flags": l.get("risk_flags", [])
} for l in linkages])}

Compare predicted scores to actual outcomes.
Identify any sectors or stages that were systematically under- or over-scored.
Calculate prediction accuracy and recommend weight adjustments for future matching.
"""

        response: schemas.SelfReflectionResponse = await gemini.generate_structured_json(
            prompt=prompt,
            schema=schemas.SelfReflectionResponse,
            system_instruction=(
                "You are the System-Level Self-Reflection Engine. "
                "You evaluate the matching platform's own accuracy, not individual actors. "
                "Be honest about systematic biases and provide specific weight adjustments."
            )
        )

        # Save to Firestore
        reflection_data = response.model_dump()
        reflection_data["programme_id"] = programme_id
        reflection_data["predicted_scores"] = predicted_scores
        reflection_data["actual_outcomes"] = actual_outcomes
        reflection_data["reflection_at"] = datetime.now(timezone.utc)

        cycle_id = f"{programme_id}_{datetime.now(timezone.utc).strftime('%Y%m%d')}"
        await dal.save_self_reflection(cycle_id, reflection_data)

        return response
