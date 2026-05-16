# LinkOS Backend Implementation Todo List

This document outlines the atomic, sequentially ordered backend tasks required to build the LinkOS API and Multi-Agent system. The tasks have been structured so that each one can be completed independently with no overlapping dependencies.

### Phase 1: Project Setup & Environment Initialization
- [x] **Task 1.1**: Initialize backend directory structure (e.g., `/backend/app/api`, `/backend/app/agents`, `/backend/scripts`).
- [x] **Task 1.2**: Set up the Python virtual environment and create `requirements.txt` (FastAPI, Uvicorn, Google Cloud SDKs, Pydantic, etc.).
- [x] **Task 1.3**: Set up environment variables handling (`.env` via `pydantic-settings`) for GCP Project, Gemini API, Vertex AI, and CORS origins.

### Phase 2: Database Layer & Data Seeding
- [x] **Task 2.1**: Initialize Firebase Admin SDK and configure the Firestore client utility singleton.
- [x] **Task 2.2**: Define Pydantic models/schemas for core entities: Mentor, Company, Programme, and Partner.
- [x] **Task 2.3**: Define Pydantic models for Linkage entities, Session Logs, Trajectory Predictions, and Evolution Forecasts.
- [x] **Task 2.4**: Implement Data Access Layer (DAL) for Firestore CRUD operations (Entities, Linkages, and Sessions).
- [x] **Task 2.5**: Write mock data generator scripts (`seed_firestore.py`, `seed_sessions.py`) to pre-seed Firestore for the demo.

### Phase 3: Core AI Infrastructure
- [x] **Task 3.1**: Implement the Vertex AI embeddings service wrapper (`text-embedding-004`).
- [x] **Task 3.2**: Implement the Gemini 2.5 Flash client wrapper (`google-genai` SDK) to handle structured JSON responses using Pydantic schemas.
- [x] **Task 3.3**: Create base prompt templates and centralized schemas for all agent inputs/outputs.

### Phase 4: Backend AI Agents Development
- [x] **Task 4.1**: Implement the `MentorAgent` logic (loads profile & history, evaluates semantic fit, computes score, formats response).
- [x] **Task 4.2**: Implement the `RiskAgent` logic (evaluates historical failure patterns and flags immediate risks).
- [x] **Task 4.3**: Implement the `OrchestratorAgent` (broadcasts match requests, gathers/ranks mentor responses, creates Linkage records).
- [x] **Task 4.4**: Implement the `TrajectoryPredictorAgent` (analyzes logged sessions and forecasts drop probability).
- [x] **Task 4.5**: Implement the `EvolutionEngine` (predicts cross-cohort fit upon engagement closure).
- [x] **Task 4.6**: Implement the `PostMortemEngine` (extracts actionable lessons/failure patterns from dropped linkages).
- [x] **Task 4.7**: Implement the `NLInterfaceAgent` (interprets plain English admin queries into Firestore operations).

### Phase 5: REST API Endpoints
- [x] **Task 5.1**: Implement `GET /api/health` for basic Cloud Run health checks.
- [x] **Task 5.2**: Implement standard CRUD REST routes (`GET` & `POST`) for `/api/entities/mentors`, `/companies`, and `/programmes`.
- [x] **Task 5.3**: Implement `GET /api/linkages` endpoint with query parameters for filtering (status, type, trajectory).
- [x] **Task 5.4**: Implement `POST /api/match/run` to trigger the matching cycle via the OrchestratorAgent.
- [x] **Task 5.5**: Implement `POST /api/linkages/{id}/confirm` (moves status to active) and `POST /api/linkages/{id}/close` (triggers PostMortem).
- [x] **Task 5.6**: Implement `POST /api/linkages/{id}/log-session` (saves session).
- [x] **Task 5.7**: Implement `GET /api/linkages/{id}/trajectory` to retrieve current relationship trajectory.
- [x] **Task 5.8**: Implement `POST /api/nl/query` endpoint for Natural Language search.

### Phase 6: Live Streaming & Background Processing
- [x] **Task 6.1**: Implement Server-Sent Events (SSE) route `GET /api/stream/reasoning` for live streaming the agent reasoning logs.
- [x] **Task 6.2**: Integrate FastAPI `BackgroundTasks` in `log-session` to run the `TrajectoryPredictorAgent` asynchronously (non-blocking).
- [x] **Task 6.3**: Connect the OrchestratorAgent matching process to the SSE dispatcher to broadcast internal logs in real-time.

### Phase 7: Deployment Configuration
- [x] **Task 7.1**: Write the `Dockerfile` and `.dockerignore` for the FastAPI application.
- [x] **Task 7.2**: Prepare Cloud Build / Google Cloud Run deployment commands (`gcloud run deploy`) with appropriate minimum instance counts.
