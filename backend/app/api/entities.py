from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
import json

from app.services import dal
from app.services.vertex_ai import get_embedding
from app.models.entities import (
    MentorCreate, MentorUpdate,
    CompanyCreate, CompanyUpdate,
    ProgrammeCreate, ProgrammeUpdate,
    PartnerCreate, PartnerUpdate,
)

router = APIRouter()


# ───────────────────────────────────────────
# Generic single-entity GET (shared by all types)
# ───────────────────────────────────────────
async def _get_single(entity_type: str, entity_id: str):
    entity = await dal.get_entity(entity_type, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail=f"{entity_type[:-1].title()} not found")
    # Attach history sub-collection
    entity["history"] = await dal.get_entity_history(entity_type, entity_id)
    return entity


# ───────────────────────────────────────────
# Mentors
# ───────────────────────────────────────────
@router.get("/mentors")
async def get_mentors():
    return await dal.list_entities("mentors")


@router.get("/mentors/{mentor_id}")
async def get_mentor(mentor_id: str):
    return await _get_single("mentors", mentor_id)


@router.post("/mentors")
async def create_mentor(mentor: MentorCreate):
    profile_text = json.dumps(mentor.profile.model_dump())
    embedding = await get_embedding(profile_text)

    data = {
        "profile": mentor.profile.model_dump(),
        "embedding_vector": embedding,
        "performance": {},
        "history": []
    }
    doc_id = await dal.create_entity("mentors", data)
    return {"id": doc_id, "status": "created"}


@router.put("/mentors/{mentor_id}")
async def update_mentor(mentor_id: str, update: MentorUpdate):
    existing = await dal.get_entity("mentors", mentor_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Mentor not found")

    payload = {}
    if update.profile:
        payload["profile"] = update.profile.model_dump()
        # Re-compute embedding when profile changes
        payload["embedding_vector"] = await get_embedding(json.dumps(payload["profile"]))
    if update.performance:
        payload["performance"] = update.performance.model_dump()

    await dal.update_entity("mentors", mentor_id, payload)
    return {"id": mentor_id, "status": "updated"}


# ───────────────────────────────────────────
# Companies
# ───────────────────────────────────────────
@router.get("/companies")
async def get_companies():
    return await dal.list_entities("companies")


@router.get("/companies/{company_id}")
async def get_company(company_id: str):
    return await _get_single("companies", company_id)


@router.post("/companies")
async def create_company(company: CompanyCreate):
    profile_text = json.dumps(company.profile.model_dump())
    embedding = await get_embedding(profile_text)

    data = {
        "profile": company.profile.model_dump(),
        "embedding_vector": embedding,
        "performance": {},
        "history": []
    }
    doc_id = await dal.create_entity("companies", data)
    return {"id": doc_id, "status": "created"}


@router.put("/companies/{company_id}")
async def update_company(company_id: str, update: CompanyUpdate):
    existing = await dal.get_entity("companies", company_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Company not found")

    payload = {}
    if update.profile:
        payload["profile"] = update.profile.model_dump()
        payload["embedding_vector"] = await get_embedding(json.dumps(payload["profile"]))
    if update.performance:
        payload["performance"] = update.performance.model_dump()

    await dal.update_entity("companies", company_id, payload)
    return {"id": company_id, "status": "updated"}


# ───────────────────────────────────────────
# Programmes
# ───────────────────────────────────────────
@router.get("/programmes")
async def get_programmes():
    return await dal.list_entities("programmes")


@router.get("/programmes/{programme_id}")
async def get_programme(programme_id: str):
    return await _get_single("programmes", programme_id)


@router.post("/programmes")
async def create_programme(prog: ProgrammeCreate):
    data = {
        "profile": prog.profile.model_dump(),
        "active_linkages": [],
        "history": []
    }
    doc_id = await dal.create_entity("programmes", data)
    return {"id": doc_id, "status": "created"}


@router.put("/programmes/{programme_id}")
async def update_programme(programme_id: str, update: ProgrammeUpdate):
    existing = await dal.get_entity("programmes", programme_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Programme not found")

    payload = {}
    if update.profile:
        payload["profile"] = update.profile.model_dump()
    if update.active_linkages is not None:
        payload["active_linkages"] = update.active_linkages

    await dal.update_entity("programmes", programme_id, payload)
    return {"id": programme_id, "status": "updated"}


# ───────────────────────────────────────────
# Partners
# ───────────────────────────────────────────
@router.get("/partners")
async def get_partners():
    return await dal.list_entities("partners")


@router.get("/partners/{partner_id}")
async def get_partner(partner_id: str):
    return await _get_single("partners", partner_id)


@router.post("/partners")
async def create_partner(partner: PartnerCreate):
    profile_text = json.dumps(partner.profile.model_dump())
    embedding = await get_embedding(profile_text)

    data = {
        "profile": partner.profile.model_dump(),
        "embedding_vector": embedding,
        "performance": {},
        "history": []
    }
    doc_id = await dal.create_entity("partners", data)
    return {"id": doc_id, "status": "created"}


@router.put("/partners/{partner_id}")
async def update_partner(partner_id: str, update: PartnerUpdate):
    existing = await dal.get_entity("partners", partner_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Partner not found")

    payload = {}
    if update.profile:
        payload["profile"] = update.profile.model_dump()
        payload["embedding_vector"] = await get_embedding(json.dumps(payload["profile"]))
    if update.performance:
        payload["performance"] = update.performance.model_dump()

    await dal.update_entity("partners", partner_id, payload)
    return {"id": partner_id, "status": "updated"}
