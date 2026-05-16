"""
Pydantic schemas for Linkage entities, Session Logs,
Trajectory Predictions, and Evolution Forecasts.

Mirrors the Firestore /linkages/ collection and sub-collections
defined in TechStack.md §2.2.
"""

from __future__ import annotations
from datetime import datetime
from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field


# ───────────────────────────────────────────
# Sub-models embedded inside a Linkage
# ───────────────────────────────────────────

class EntitySnapshot(BaseModel):
    """Lightweight snapshot of an entity stored inside a linkage."""
    id: str
    type: str                           # "mentor" | "company" | "programme" | "partner"
    snapshot: Dict = Field(default_factory=dict)


class LinkageFeedback(BaseModel):
    admin_rating: Optional[int] = None
    company_rating: Optional[int] = None
    notes: Optional[str] = None


class PostMortem(BaseModel):
    failure_tags: List[str] = Field(default_factory=list)
    avoid_pairing_with: List[str] = Field(default_factory=list)
    lessons: List[str] = Field(default_factory=list)
    analysed_at: Optional[datetime] = None


class TrajectoryPrediction(BaseModel):
    """Output of the Trajectory Predictor Agent (F11)."""
    status: Literal["improving", "stable", "declining", "critical"] = "stable"
    predicted_final_rating: float = 0.0
    predicted_outcome: Literal["completed", "drop", "reassignment_needed"] = "completed"
    drop_probability: float = 0.0
    predicted_drop_week: Optional[int] = None
    confidence: Literal["high", "medium", "low"] = "medium"
    trajectory_reason: str = ""
    recommended_action: str = ""
    action_urgency: Literal["immediate", "this_week", "monitor"] = "monitor"
    last_computed_at: Optional[datetime] = None


class EvolutionForecast(BaseModel):
    """Output of the Cross-Cohort Evolution Engine (F12)."""
    forecast_generated_at: Optional[datetime] = None
    cohort_fit_scores: Dict[str, int] = Field(default_factory=dict)   # e.g. {"cohort_3": 84, "cohort_4": 61}
    mismatch_predicted_at_cohort: Optional[int] = None
    forecast_reason: str = ""
    recommended_action: str = ""


# ───────────────────────────────────────────
# Linkage (top-level document)
# ───────────────────────────────────────────

class Linkage(BaseModel):
    id: Optional[str] = None
    type: Literal["mentor_company", "company_programme", "partner_initiative"] = "mentor_company"
    entity_a: EntitySnapshot
    entity_b: EntitySnapshot
    status: Literal["proposed", "active", "completed", "dropped", "reassigned"] = "proposed"
    fit_score: int = 0
    reasoning: str = ""
    risk_flags: List[str] = Field(default_factory=list)
    confidence: Literal["high", "medium", "low"] = "medium"
    created_by: str = "orchestrator_agent"
    programme_id: Optional[str] = None
    feedback: LinkageFeedback = Field(default_factory=LinkageFeedback)
    post_mortem: Optional[PostMortem] = None
    trajectory: Optional[TrajectoryPrediction] = None
    evolution_forecast: Optional[EvolutionForecast] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LinkageCreate(BaseModel):
    """Payload used by the Orchestrator when creating a new linkage."""
    type: Literal["mentor_company", "company_programme", "partner_initiative"] = "mentor_company"
    entity_a: EntitySnapshot
    entity_b: EntitySnapshot
    fit_score: int = 0
    reasoning: str = ""
    risk_flags: List[str] = Field(default_factory=list)
    confidence: Literal["high", "medium", "low"] = "medium"
    programme_id: Optional[str] = None


# ───────────────────────────────────────────
# Session Log (sub-collection of a Linkage)
# ───────────────────────────────────────────

class SessionLog(BaseModel):
    """A single mentoring session record (F11)."""
    id: Optional[str] = None
    session_number: int
    date: datetime
    attended: bool = True
    rating: float = 3.0                # 1.0 – 5.0
    response_time_hours: float = 0.0
    notes: str = ""
    logged_at: Optional[datetime] = None


class SessionLogCreate(BaseModel):
    """Payload from the admin when logging a session."""
    session_number: int
    date: datetime
    attended: bool = True
    rating: float = 3.0
    response_time_hours: float = 0.0
    notes: str = ""
