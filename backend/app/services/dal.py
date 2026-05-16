"""
Data Access Layer (DAL) for Firestore CRUD operations.

Provides async helper functions for reading/writing Entities, Linkages,
and Session Logs.  All functions use the shared Firestore async client
from services.firestore.
"""

from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from google.cloud.firestore_v1 import AsyncClient

from app.services.firestore import get_firestore_client


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _db() -> AsyncClient:
    return get_firestore_client()


# ───────────────────────────────────────────
# Generic helpers
# ───────────────────────────────────────────

async def _get_doc(collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single document by collection path and ID."""
    ref = _db().collection(collection).document(doc_id)
    snap = await ref.get()
    if not snap.exists:
        return None
    data = snap.to_dict()
    data["id"] = snap.id
    return data


async def _list_docs(
    collection: str,
    filters: Optional[Dict[str, Any]] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """List documents with optional field-equality filters."""
    query = _db().collection(collection)
    if filters:
        for field, value in filters.items():
            query = query.where(field, "==", value)
    query = query.limit(limit)
    docs = []
    async for snap in query.stream():
        data = snap.to_dict()
        data["id"] = snap.id
        docs.append(data)
    return docs


async def _create_doc(
    collection: str,
    data: Dict[str, Any],
    doc_id: Optional[str] = None,
) -> str:
    """Create a document.  Returns the document ID."""
    data["created_at"] = _now()
    data["updated_at"] = _now()
    if doc_id:
        ref = _db().collection(collection).document(doc_id)
        await ref.set(data)
        return doc_id
    else:
        _, ref = await _db().collection(collection).add(data)
        return ref.id


async def _update_doc(
    collection: str,
    doc_id: str,
    data: Dict[str, Any],
) -> None:
    """Merge-update fields on an existing document."""
    data["updated_at"] = _now()
    ref = _db().collection(collection).document(doc_id)
    await ref.update(data)


async def _delete_doc(collection: str, doc_id: str) -> None:
    ref = _db().collection(collection).document(doc_id)
    await ref.delete()


# ───────────────────────────────────────────
# Entity operations  (mentors, companies, programmes, partners)
# ───────────────────────────────────────────

ENTITY_COLLECTIONS = {
    "mentors":    "entities/mentors/items",
    "companies":  "entities/companies/items",
    "programmes": "entities/programmes/items",
    "partners":   "entities/partners/items",
}


async def get_entity(entity_type: str, entity_id: str) -> Optional[Dict]:
    col = ENTITY_COLLECTIONS[entity_type]
    return await _get_doc(col, entity_id)


async def list_entities(
    entity_type: str,
    filters: Optional[Dict[str, Any]] = None,
    limit: int = 100,
) -> List[Dict]:
    col = ENTITY_COLLECTIONS[entity_type]
    return await _list_docs(col, filters, limit)


async def create_entity(entity_type: str, data: Dict, doc_id: Optional[str] = None) -> str:
    col = ENTITY_COLLECTIONS[entity_type]
    return await _create_doc(col, data, doc_id)


async def update_entity(entity_type: str, entity_id: str, data: Dict) -> None:
    col = ENTITY_COLLECTIONS[entity_type]
    await _update_doc(col, entity_id, data)


async def delete_entity(entity_type: str, entity_id: str) -> None:
    col = ENTITY_COLLECTIONS[entity_type]
    await _delete_doc(col, entity_id)


async def get_all_entity_ids(entity_type: str) -> List[str]:
    """Return just the IDs for every document in an entity collection."""
    col = ENTITY_COLLECTIONS[entity_type]
    ids = []
    async for snap in _db().collection(col).select([]).stream():
        ids.append(snap.id)
    return ids


# ───────────────────────────────────────────
# Entity history sub-collection
# ───────────────────────────────────────────

async def get_entity_history(entity_type: str, entity_id: str) -> List[Dict]:
    col = ENTITY_COLLECTIONS[entity_type]
    path = f"{col}/{entity_id}/history"
    return await _list_docs(path)


async def add_entity_history(entity_type: str, entity_id: str, data: Dict) -> str:
    col = ENTITY_COLLECTIONS[entity_type]
    path = f"{col}/{entity_id}/history"
    return await _create_doc(path, data)


# ───────────────────────────────────────────
# Linkage operations
# ───────────────────────────────────────────

LINKAGES_COL = "linkages"


async def get_linkage(linkage_id: str) -> Optional[Dict]:
    return await _get_doc(LINKAGES_COL, linkage_id)


async def list_linkages(
    filters: Optional[Dict[str, Any]] = None,
    limit: int = 100,
) -> List[Dict]:
    return await _list_docs(LINKAGES_COL, filters, limit)


async def create_linkage(data: Dict, doc_id: Optional[str] = None) -> str:
    return await _create_doc(LINKAGES_COL, data, doc_id)


async def update_linkage(linkage_id: str, data: Dict) -> None:
    await _update_doc(LINKAGES_COL, linkage_id, data)


async def delete_linkage(linkage_id: str) -> None:
    await _delete_doc(LINKAGES_COL, linkage_id)


# ───────────────────────────────────────────
# Session log sub-collection  (under /linkages/{id}/sessions)
# ───────────────────────────────────────────

async def get_sessions(linkage_id: str) -> List[Dict]:
    """Get all session logs for a linkage, ordered by session_number."""
    path = f"{LINKAGES_COL}/{linkage_id}/sessions"
    query = _db().collection(path).order_by("session_number")
    docs = []
    async for snap in query.stream():
        data = snap.to_dict()
        data["id"] = snap.id
        docs.append(data)
    return docs


async def add_session(linkage_id: str, data: Dict) -> str:
    """Append a new session log to a linkage."""
    path = f"{LINKAGES_COL}/{linkage_id}/sessions"
    data["logged_at"] = _now()
    return await _create_doc(path, data)


# ───────────────────────────────────────────
# System collections  (self-reflection, NL queries)
# ───────────────────────────────────────────

async def save_self_reflection(cycle_id: str, data: Dict) -> None:
    await _create_doc("system/self_reflection/items", data, doc_id=cycle_id)


async def save_nl_query(data: Dict) -> str:
    return await _create_doc("system/nl_queries/items", data)
