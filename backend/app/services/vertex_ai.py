"""
Vertex AI Embeddings Service.

Provides a wrapper for the `text-embedding-004` model to convert text
into 768-dimensional vectors for semantic similarity matching.
"""

import asyncio
import vertexai
from vertexai.language_models import TextEmbeddingModel
from typing import List

from app.config import settings


_embedding_model: TextEmbeddingModel | None = None


def _init_vertex() -> None:
    """Initialize Vertex AI with project and region from settings."""
    vertexai.init(
        project=settings.google_cloud_project,
        location=settings.vertex_region,
    )


def _get_embedding_sync(text: str) -> List[float]:
    """Synchronous call to generate an embedding."""
    global _embedding_model
    if _embedding_model is None:
        _init_vertex()
        _embedding_model = TextEmbeddingModel.from_pretrained(settings.vertex_embedding_model)
    
    embeddings = _embedding_model.get_embeddings([text])
    return embeddings[0].values


async def get_embedding(text: str) -> List[float]:
    """
    Asynchronous wrapper to generate an embedding vector.
    Runs the blocking Vertex AI call in a thread pool.
    """
    return await asyncio.to_thread(_get_embedding_sync, text)


def compute_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    import numpy as np
    a = np.array(vec_a)
    b = np.array(vec_b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
