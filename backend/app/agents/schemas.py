"""
Pydantic schemas used specifically for Agent structured outputs (F1, F10, F11, F12).
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field

# ───────────────────────────────────────────
# Mentor Agent Output
# ───────────────────────────────────────────
class FitScoreResponse(BaseModel):
    fit_score: int = Field(..., description="Score from 0 to 100 representing the fit")
    reasoning: str = Field(..., description="1-2 sentences explaining the score based on history and semantics")
    confidence: Literal["high", "medium", "low"] = Field(..., description="Confidence level of this match")


# ───────────────────────────────────────────
# Risk Agent Output
# ───────────────────────────────────────────
class RiskAgentResponse(BaseModel):
    risk_flags: List[str] = Field(..., description="List of detected failure patterns or risk warnings")
    risk_severity: Literal["none", "low", "medium", "high"] = Field(..., description="Overall risk severity")


# ───────────────────────────────────────────
# Post-Mortem Engine Output
# ───────────────────────────────────────────
class PostMortemResponse(BaseModel):
    failure_tags: List[str] = Field(..., description="Short tags describing the failure (e.g. 'poor_communication')")
    avoid_pairing_with: List[str] = Field(..., description="Types of companies to avoid in future")
    lessons: List[str] = Field(..., description="Key actionable lessons extracted from the failure")


# ───────────────────────────────────────────
# Trajectory Predictor Output (F11)
# ───────────────────────────────────────────
class TrajectoryPredictionResponse(BaseModel):
    status: Literal["improving", "stable", "declining", "critical"]
    predicted_final_rating: float
    predicted_outcome: Literal["completed", "drop", "reassignment_needed"]
    drop_probability: float
    predicted_drop_week: Optional[int]
    confidence: Literal["high", "medium", "low"]
    trajectory_reason: str
    recommended_action: str
    action_urgency: Literal["immediate", "this_week", "monitor"]


# ───────────────────────────────────────────
# Evolution Engine Output (F12)
# ───────────────────────────────────────────
class EvolutionForecastResponse(BaseModel):
    cohort_fit_scores: dict[str, int] = Field(..., description="Predicted fit scores for future cohorts, keyed by cohort name")
    mismatch_predicted_at_cohort: Optional[int] = Field(None, description="Cohort number where score drops below 60")
    forecast_reason: str
    recommended_action: str
