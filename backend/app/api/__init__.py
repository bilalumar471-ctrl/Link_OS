from fastapi import APIRouter
from app.api import auth, entities, linkages, match, system, stream

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(system.router, tags=["system"])
api_router.include_router(entities.router, prefix="/entities", tags=["entities"])
api_router.include_router(linkages.router, prefix="/linkages", tags=["linkages"])
api_router.include_router(match.router, prefix="/match", tags=["match"])
api_router.include_router(stream.router, prefix="/stream", tags=["stream"])
