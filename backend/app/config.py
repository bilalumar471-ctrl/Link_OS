import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    google_cloud_project: str = "linkos-myhack-2026"
    google_application_credentials: str = "/app/service-account.json"
    
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_max_tokens: int = 2048
    
    vertex_embedding_model: str = "text-embedding-004"
    vertex_region: str = "asia-southeast1"
    
    firestore_database: str = "(default)"
    
    api_base_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5175"
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ]
    
    enable_self_reflection: bool = True
    enable_risk_agent: bool = True
    enable_replay_mode: bool = True
    enable_trajectory_predictor: bool = True
    enable_evolution_engine: bool = True
    min_cloud_run_instances: int = 1

    # JWT Auth
    jwt_secret_key: str = "fallback-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 12

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

if settings.google_application_credentials and os.path.isfile(settings.google_application_credentials):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
