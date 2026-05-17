from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import api_router
from app.config import settings
from app.api.auth import seed_default_users

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed default users into Firestore
    await seed_default_users()
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
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175", 
        "http://localhost:3000", 
        "https://linkos-myhack-2026.web.app", 
        "https://linkos-myhack-2026.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
# Trigger reload
