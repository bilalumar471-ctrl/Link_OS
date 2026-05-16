from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import api_router
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    yield
    # Shutdown actions

app = FastAPI(
    title="LinkOS API",
    description="Multi-Agent Ecosystem Linkage Platform",
    version="1.2.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
