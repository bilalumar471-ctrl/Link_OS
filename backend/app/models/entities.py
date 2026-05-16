"""
Pydantic schemas for core ecosystem entities:
Mentor, Company, Programme, Partner.

These mirror the Firestore /entities/ collections defined in TechStack.md §2.2.
"""

from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


# ───────────────────────────────────────────
# Shared sub-models
# ───────────────────────────────────────────

class EngagementHistory(BaseModel):
    """A single historical engagement record (sub-collection doc)."""
    id: Optional[str] = None
    company_id: Optional[str] = None
    mentor_id: Optional[str] = None
    programme_id: Optional[str] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    outcome: Optional[str] = None            # "completed" | "dropped" | "reassigned"
    ratings: Optional[Dict[str, int]] = None  # e.g. {"admin": 4, "company": 3}
    notes: Optional[str] = None
    sessions_completed: int = 0
    sessions_missed: int = 0
    flags: List[str] = Field(default_factory=list)


# ───────────────────────────────────────────
# Mentor
# ───────────────────────────────────────────

class MentorProfile(BaseModel):
    name: str
    expertise: List[str] = Field(default_factory=list)
    sectors: List[str] = Field(default_factory=list)
    region: str = ""
    stage_pref: str = ""
    bio: str = ""


class MentorPerformance(BaseModel):
    avg_rating: float = 0.0
    completion_rate: float = 0.0
    session_attendance: float = 0.0
    domain_match_score: float = 0.0
    total_engagements: int = 0
    strength_tags: List[str] = Field(default_factory=list)
    weakness_tags: List[str] = Field(default_factory=list)
    failure_patterns: List[str] = Field(default_factory=list)
    last_updated: Optional[datetime] = None


class Mentor(BaseModel):
    id: Optional[str] = None
    profile: MentorProfile
    embedding_vector: List[float] = Field(default_factory=list)
    performance: MentorPerformance = Field(default_factory=MentorPerformance)
    history: List[EngagementHistory] = Field(default_factory=list)


class MentorCreate(BaseModel):
    """Payload for creating a new mentor (embedding computed server-side)."""
    profile: MentorProfile


class MentorUpdate(BaseModel):
    """Payload for partial updates to a mentor."""
    profile: Optional[MentorProfile] = None
    performance: Optional[MentorPerformance] = None


# ───────────────────────────────────────────
# Company
# ───────────────────────────────────────────

class CompanyProfile(BaseModel):
    name: str
    stage: str = ""          # Pre-seed | Seed | Series A | Series B
    sector: str = ""
    needs: List[str] = Field(default_factory=list)
    region: str = ""
    founding_year: Optional[int] = None


class CompanyPerformance(BaseModel):
    responsiveness_score: float = 0.0
    follow_through_rate: float = 0.0
    avg_mentor_rating_given: float = 0.0


class Company(BaseModel):
    id: Optional[str] = None
    profile: CompanyProfile
    embedding_vector: List[float] = Field(default_factory=list)
    performance: CompanyPerformance = Field(default_factory=CompanyPerformance)
    history: List[EngagementHistory] = Field(default_factory=list)


class CompanyCreate(BaseModel):
    profile: CompanyProfile


class CompanyUpdate(BaseModel):
    profile: Optional[CompanyProfile] = None
    performance: Optional[CompanyPerformance] = None


# ───────────────────────────────────────────
# Programme
# ───────────────────────────────────────────

class ProgrammeCriteria(BaseModel):
    sector_focus: List[str] = Field(default_factory=list)
    stage_required: Optional[str] = None
    region: str = ""
    expertise_needed: List[str] = Field(default_factory=list)


class ProgrammeProfile(BaseModel):
    name: str
    criteria: ProgrammeCriteria = Field(default_factory=ProgrammeCriteria)
    cohort_size: int = 10
    sector_focus: List[str] = Field(default_factory=list)
    region: str = ""
    start_date: Optional[datetime] = None


class ProgrammeCycleHistory(BaseModel):
    id: Optional[str] = None
    linkage_ids: List[str] = Field(default_factory=list)
    avg_engagement_quality: float = 0.0
    dropout_rate: float = 0.0
    lessons: List[str] = Field(default_factory=list)


class Programme(BaseModel):
    id: Optional[str] = None
    profile: ProgrammeProfile
    active_linkages: List[str] = Field(default_factory=list)
    history: List[ProgrammeCycleHistory] = Field(default_factory=list)


class ProgrammeCreate(BaseModel):
    profile: ProgrammeProfile


class ProgrammeUpdate(BaseModel):
    profile: Optional[ProgrammeProfile] = None
    active_linkages: Optional[List[str]] = None


# ───────────────────────────────────────────
# Partner
# ───────────────────────────────────────────

class PartnerProfile(BaseModel):
    name: str
    services: List[str] = Field(default_factory=list)
    regions: List[str] = Field(default_factory=list)
    terms: str = ""


class PartnerPerformance(BaseModel):
    delivery_quality: float = 0.0
    on_time_rate: float = 0.0
    avg_rating: float = 0.0


class Partner(BaseModel):
    id: Optional[str] = None
    profile: PartnerProfile
    embedding_vector: List[float] = Field(default_factory=list)
    performance: PartnerPerformance = Field(default_factory=PartnerPerformance)
    history: List[EngagementHistory] = Field(default_factory=list)


class PartnerCreate(BaseModel):
    profile: PartnerProfile


class PartnerUpdate(BaseModel):
    profile: Optional[PartnerProfile] = None
    performance: Optional[PartnerPerformance] = None
