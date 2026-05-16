# LinkOS — Technology Stack
**Platform:** Google Antigravity
**Hackathon:** Build With AI 2026 KL – MyHack
**Version:** 1.2.0

---

## Changelog — v1.2.0
- FIX 1: All Gemini references standardised to `gemini-2.5-flash`
- FIX 2: React version standardised to React 19 throughout
- FIX 4: `react-flow` entry updated with specific screen and usage
- FIX 6: Authentication section added (Firebase Auth — Google Sign-In)

---

## 1. Platform Overview

LinkOS is deployed entirely on **Google Antigravity** — Google's unified AI application platform. Every technology choice is native to the Google ecosystem, which directly satisfies the **Google Technology Integration (15 pts)** rubric criterion.

---

## 2. Complete Tech Stack

### 2.1 AI & Machine Learning Layer

#### Gemini 2.5 Flash — Agent Intelligence
**Role:** Powers all agent types (Mentor, Company, Programme, Partner, Orchestrator, Risk, Trajectory Predictor, Self-Reflection Engine)
**Why chosen over alternatives:**
- Function calling (tool use) allows agents to call Firestore read/write tools natively — this is what gives agents their ability to act, not just respond
- Streaming responses enable the live reasoning log UI via Server-Sent Events
- 1M token context window allows agents to include full engagement history without chunking
- Gemini 2.5 Flash is optimised for low-latency, high-throughput agent calls — critical for multi-agent chains

**Hallucination mitigation:**
- All agent responses constrained to structured JSON via function calling schemas
- Agents only make decisions based on tool-returned data — they cannot fabricate profile details
- Human confirmation gate before any linkage becomes `active`
- Trajectory predictions include confidence indicators and explicit reasoning text — never a bare probability

```python
# Agent call pattern
response = gemini_client.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    tools=agent_tools,
    generation_config={
        "response_mime_type": "application/json",
        "response_schema": FitScoreResponse  # enforced schema
    }
)
```

#### Vertex AI Text Embeddings — Semantic Matching
**Model:** `text-embedding-004`
**Role:** Converts actor profiles into 768-dimensional vectors for semantic similarity matching
**Why this is not keyword matching:**
- A mentor with "revenue growth" expertise will semantically match a company that needs "GTM strategy" — keyword matching would miss this
- Embeddings capture meaning, not just terms
- Cosine similarity between company needs embedding and mentor expertise embedding gives a baseline semantic fit score

```python
from vertexai.language_models import TextEmbeddingModel

model = TextEmbeddingModel.from_pretrained("text-embedding-004")

def get_embedding(text: str) -> list[float]:
    embeddings = model.get_embeddings([text])
    return embeddings[0].values  # 768-dimensional vector

def compute_similarity(vec_a: list, vec_b: list) -> float:
    import numpy as np
    a, b = np.array(vec_a), np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
```

**When embeddings are generated:**
- On entity creation (mentor/company profile saved)
- On entity update (expertise or needs change)
- Stored in Firestore `embedding_vector` field — not recomputed on every match

---

### 2.2 Database Layer

#### Cloud Firestore — Entity, Linkage & Session Store
**Role:** Persistent store for all actors, linkages, session logs, trajectory predictions, and performance data
**Why Firestore over alternatives:**
- Real-time listeners allow the UI reasoning log to stream updates without polling
- Document-subcollection model maps perfectly to the entity + history + session data structure
- Horizontal auto-scaling — no schema migrations as new programmes or regions are added
- Native support for compound queries (filter by sector + region + performance score)

**Collections Architecture:**

```
/entities/
  /mentors/{mentor_id}
    ├── profile: { name, expertise[], sectors[], region, stage_pref, bio }
    ├── embedding_vector: [float * 768]
    ├── performance: {
    │     avg_rating: float,
    │     completion_rate: float,
    │     session_attendance: float,
    │     domain_match_score: float,
    │     total_engagements: int,
    │     strength_tags: string[],
    │     weakness_tags: string[],
    │     failure_patterns: string[],
    │     last_updated: timestamp
    │   }
    └── /history/{engagement_id}
          ├── company_id: ref
          ├── programme_id: ref
          ├── period: { start: timestamp, end: timestamp }
          ├── outcome: "completed" | "dropped" | "reassigned"
          ├── ratings: { admin: int, company: int }
          ├── notes: string
          ├── sessions_completed: int
          ├── sessions_missed: int
          └── flags: string[]

  /companies/{company_id}
    ├── profile: { name, stage, sector, needs[], region, founding_year }
    ├── embedding_vector: [float * 768]
    ├── performance: { responsiveness_score, follow_through_rate, avg_mentor_rating_given }
    └── /history/{engagement_id} [same structure as mentor history]

  /programmes/{programme_id}
    ├── profile: { name, criteria{}, cohort_size, sector_focus[], region, start_date }
    ├── active_linkages: linkage_id[]
    └── /history/{cycle_id}
          ├── linkage_ids: ref[]
          ├── avg_engagement_quality: float
          ├── dropout_rate: float
          └── lessons: string[]

  /partners/{partner_id}
    ├── profile: { name, services[], regions[], terms }
    ├── performance: { delivery_quality, on_time_rate, avg_rating }
    └── /history/{engagement_id}

/linkages/{linkage_id}
  ├── type: "mentor_company" | "company_programme" | "partner_initiative"
  ├── entity_a: { id, type, snapshot: {} }
  ├── entity_b: { id, type, snapshot: {} }
  ├── status: "proposed" | "active" | "completed" | "dropped"
  ├── fit_score: int (0-100)
  ├── reasoning: string
  ├── risk_flags: string[]
  ├── confidence: "high" | "medium" | "low"
  ├── created_by: "orchestrator_agent"
  ├── programme_id: ref
  ├── feedback: { admin_rating: int, company_rating: int, notes: string }
  ├── post_mortem: { failure_tags: [], lessons: [], analysed_at: timestamp }
  │
  ├── trajectory: {                              ← F11
  │     status: "improving"|"stable"|"declining"|"critical",
  │     predicted_final_rating: float,
  │     predicted_outcome: "completed"|"drop"|"reassignment_needed",
  │     drop_probability: float,
  │     predicted_drop_week: int | null,
  │     confidence: "high"|"medium"|"low",
  │     trajectory_reason: string,
  │     recommended_action: string,
  │     action_urgency: "immediate"|"this_week"|"monitor",
  │     last_computed_at: timestamp
  │   }
  │
  ├── evolution_forecast: {                      ← F12
  │     forecast_generated_at: timestamp,
  │     cohort_fit_scores: { "cohort_N": int },
  │     mismatch_predicted_at_cohort: int | null,
  │     forecast_reason: string,
  │     recommended_action: string
  │   }
  │
  ├── created_at: timestamp
  └── updated_at: timestamp

  └── /sessions/{session_id}                     ← F11
        ├── session_number: int
        ├── date: timestamp
        ├── attended: boolean
        ├── rating: float (1–5)
        ├── response_time_hours: float
        ├── notes: string
        └── logged_at: timestamp

/system/
  /self_reflection/{cycle_id}                    ← F9
    ├── programme_id: ref
    ├── predicted_scores: {}
    ├── actual_outcomes: {}
    ├── prediction_accuracy: float
    ├── bias_observations: string[]
    ├── weight_adjustments: {}
    ├── reflection_summary: string
    └── reflection_at: timestamp

  /nl_queries/{query_id}
    ├── raw_input: string
    ├── interpreted_intent: string
    ├── firestore_operations: {}
    └── result_summary: string
```

---

### 2.3 Backend Layer

#### FastAPI — API Server
**Runtime:** Python 3.11
**Deployment:** Cloud Run (Google Antigravity)
**Role:** Orchestrates agent calls, manages Firestore transactions, exposes REST endpoints to React frontend

**Key Endpoints:**

```
POST   /api/match/run                  → Trigger full matching cycle for a programme
GET    /api/entities/mentors           → List all mentors with performance summary
GET    /api/entities/mentors/{id}      → Get mentor full profile + history
POST   /api/entities/mentors          → Create new mentor entity
PUT    /api/entities/mentors/{id}      → Update mentor profile (triggers embedding refresh)
GET    /api/linkages                   → List all linkages with filters
POST   /api/linkages/{id}/confirm      → Admin confirms proposed linkage → active
POST   /api/linkages/{id}/close        → Close linkage + trigger post-mortem
POST   /api/linkages/{id}/log-session  → Log a session + trigger Trajectory Predictor
GET    /api/linkages/{id}/trajectory   → Get current trajectory prediction for linkage
POST   /api/nl/query                   → Natural language admin query
GET    /api/stream/reasoning           → SSE stream for live agent reasoning log
GET    /api/health                     → Health check for Cloud Run
```

**Agent orchestration pattern:**

```python
# agents/orchestrator.py
class OrchestratorAgent:
    async def run_matching(self, programme_id: str):
        programme = await firestore.get_entity("programmes", programme_id)
        criteria_embedding = await vertex_ai.embed(programme.criteria_text)

        # Broadcast to all mentor agents concurrently
        mentor_ids = await firestore.get_all_mentor_ids()
        tasks = [self.call_mentor_agent(mid, programme, criteria_embedding)
                 for mid in mentor_ids]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter valid responses, rank by score
        valid = [r for r in responses if not isinstance(r, Exception)]
        ranked = sorted(valid, key=lambda x: x.fit_score, reverse=True)

        # Create linkage entities for top N matches
        linkages = []
        for match in ranked[:programme.cohort_size]:
            linkage = await firestore.create_linkage({
                "status": "proposed",
                "fit_score": match.fit_score,
                "reasoning": match.reasoning,
                "risk_flags": match.risk_flags,
            })
            linkages.append(linkage)

        return linkages

    async def call_mentor_agent(self, mentor_id, programme, criteria_embedding):
        context = await self.build_agent_context(mentor_id)
        similarity = compute_similarity(criteria_embedding, context.embedding)

        response = await gemini.generate(
            model="gemini-2.5-flash",
            system=MENTOR_AGENT_PROMPT.format(**context),
            message=f"Evaluate: {programme.criteria}. Base semantic score: {similarity:.2f}",
            tools=mentor_agent_tools,
            stream=True  # for reasoning log
        )
        return MentorAgentResponse(**response)
```

**Trajectory Predictor — agent pattern:**

```python
# agents/trajectory_predictor.py
class TrajectoryPredictorAgent:
    async def predict(self, linkage_id: str) -> TrajectoryPrediction:
        linkage = await firestore.get_linkage(linkage_id)
        sessions = await firestore.get_sessions(linkage_id)

        # Require at least 2 sessions for trend analysis
        if len(sessions) < 2:
            return None

        mentor = await firestore.get_entity("mentors", linkage.mentor_id)

        prompt = TRAJECTORY_PREDICTOR_PROMPT.format(
            mentor_profile=mentor.profile,
            mentor_failure_patterns=mentor.performance.failure_patterns,
            company_profile=linkage.entity_b.snapshot,
            sessions=format_sessions(sessions),
            total_planned_sessions=linkage.total_sessions
        )

        response = await gemini.generate(
            model="gemini-2.5-flash",
            system=prompt,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": TrajectoryPrediction
            }
        )

        prediction = TrajectoryPrediction(**response)

        # Write back to Firestore
        await firestore.update_linkage(linkage_id, {
            "trajectory": prediction.dict(),
            "updated_at": now()
        })

        # Push alert to dashboard if declining or critical
        if prediction.status in ["declining", "critical"]:
            await self.push_trajectory_alert(linkage_id, prediction)

        return prediction


# POST /api/linkages/{id}/log-session
async def log_session(linkage_id: str, session: SessionLog):
    await firestore.add_session(linkage_id, session.dict())

    # Run trajectory predictor as background task — non-blocking
    background_tasks.add_task(
        trajectory_agent.predict, linkage_id
    )

    return {"status": "logged"}
```

**Cross-Cohort Evolution Engine — runs on linkage close:**

```python
# agents/evolution_engine.py
class EvolutionEngine:
    async def forecast(self, linkage_id: str):
        linkage = await firestore.get_linkage(linkage_id)
        mentor_history = await firestore.get_history("mentors", linkage.mentor_id)
        company_history = await firestore.get_history("companies", linkage.company_id)

        response = await gemini.generate(
            model="gemini-2.5-flash",
            system=EVOLUTION_ENGINE_PROMPT,
            message=f"""
            Mentor history: {mentor_history}
            Company growth trajectory: {company_history}
            Current cohort fit score: {linkage.fit_score}
            Predict fit scores for next 3 cohorts.
            """,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": EvolutionForecast
            }
        )

        forecast = EvolutionForecast(**response)
        await firestore.update_linkage(linkage_id, {
            "evolution_forecast": forecast.dict()
        })
        return forecast
```

---

### 2.4 Frontend Layer

#### React 19 + TypeScript — Dashboard UI
**Designed via:** Stitch MCP Server
**Styling:** Tailwind CSS
**State Management:** React Query (server state) + Zustand (UI state)
**Real-time:** Firebase SDK real-time listeners (Firestore) + EventSource (SSE for reasoning log)

**Key Libraries:**
| Library | Version | Purpose |
|---|---|---|
| react | 19.x | UI framework |
| typescript | 5.x | Type safety |
| tailwindcss | 4.x | Utility-first styling |
| react-query | 5.x | Server state, caching |
| zustand | 4.x | Lightweight global UI state |
| recharts | 2.x | Performance charts, cohort forecast, sparklines |
| react-flow | 11.x | Agent communication graph on /logs page (Graph View toggle) — directed message flow between agents per matching run, with clickable nodes and edges |
| framer-motion | 11.x | Reasoning log entry animations, trajectory chip transitions |
| firebase | 10.x | Auth (Google Sign-In) + Firestore real-time listeners |
| lucide-react | latest | Icon set (consistent with shadcn/ui) |
| shadcn/ui | latest | Dialog, Badge, Tabs, Toast components |
| date-fns | 3.x | Date formatting for engagement timelines |

---

### 2.4.1 Authentication

**Method:** Firebase Authentication — Google Sign-In (OAuth 2.0)
**Why:** Single implementation step, another Google technology touchpoint for the rubric, zero password management, works natively with Firestore security rules.

**Implementation:**
```typescript
// frontend/src/lib/auth.ts
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"

const auth = getAuth()
const provider = new GoogleAuthProvider()

export const signIn = () => signInWithPopup(auth, provider)
export const signOut = () => auth.signOut()
export const useCurrentUser = () => auth.currentUser
```

**Protected routes:** All routes except `/login` require an authenticated Firebase user. Use a `<ProtectedRoute>` wrapper component that checks for a Firebase auth session and redirects to `/login` if none exists.

```typescript
// frontend/src/components/ProtectedRoute.tsx
import { useAuthState } from "react-firebase-hooks/auth"
import { Navigate } from "react-router-dom"
import { auth } from "@/lib/firebase"

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, loading] = useAuthState(auth)
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

**Demo consideration:** Pre-authenticate with the team Google account before the demo starts. Firebase auth state persists in localStorage — no re-login needed during presentation.

---

### 2.5 Infrastructure Layer

#### Cloud Run — Backend Deployment
- Containerised FastAPI app deployed to Cloud Run
- Auto-scales from 0 to N instances based on request volume
- Minimum instances: 1 (to eliminate cold start during demo)
- Region: `asia-southeast1` (Singapore — lowest latency from KL)

#### Firebase Hosting — Frontend Deployment
- React 19 build deployed to Firebase Hosting
- CDN-backed global delivery
- Sub-200ms TTFB from Southeast Asia

#### Firebase Authentication — Identity
- Google Sign-In OAuth 2.0
- Integrated with Firestore security rules for production-grade data protection

#### Cloud Build — CI/CD
- Automatic rebuild and redeploy on push to `main`
- Build time: < 3 minutes (critical for hackathon iteration speed)

---

## 3. Why Google Technologies (Rubric Justification)

| Technology | Why Google, not an alternative |
|---|---|
| Gemini 2.5 Flash | Only model with native function calling + streaming + 1M context in one API. Powers all matching agents, Trajectory Predictor, and Evolution Engine in the same stack with no additional integration. |
| Vertex AI Embeddings | `text-embedding-004` outperforms alternatives on multilingual benchmarks — critical since ecosystem data includes Malay and English content |
| Firestore | Real-time listeners are native; no polling required for reasoning log or trajectory updates. |
| Cloud Run | Zero-config auto-scaling with Google IAM native integration. Trajectory Predictor background tasks handled by FastAPI BackgroundTasks — no separate queue infrastructure needed. |
| Firebase Hosting | Sub-200ms TTFB from Southeast Asia. Integrated with Cloud Run backend. |
| Firebase Authentication | Google Sign-In OAuth 2.0 — zero password management, native Firestore security rule integration, additional Google technology touchpoint. |

---

## 4. Data Flow Diagram

```
[ADMIN UI — Login]
    │
    │ Google Sign-In (Firebase Auth)
    ▼
[Firebase Authentication]
    │ auth token
    ▼
[ADMIN UI — Dashboard]
    │
    │ HTTP POST /api/match/run
    ▼
[FastAPI — Cloud Run]
    │
    ├── 1. Read Programme from Firestore
    ├── 2. Embed Programme criteria via Vertex AI
    ├── 3. Fetch all Mentor embeddings from Firestore
    ├── 4. Compute semantic similarity (cosine)
    ├── 5. Call Gemini 2.5 Flash for each Mentor Agent (concurrent)
    │       └── Gemini reads mentor history via tool call
    │       └── Gemini scores fit against criteria + history
    │       └── Gemini returns: score, reasoning, risk_flags
    ├── 6. Orchestrator ranks all responses
    ├── 7. Create Linkage Entities in Firestore (status: proposed)
    └── 8. Stream reasoning log to UI via SSE

[ADMIN UI — Session Log]
    │
    │ HTTP POST /api/linkages/{id}/log-session
    ▼
[FastAPI — Cloud Run]
    ├── 1. Write session to /linkages/{id}/sessions/
    └── 2. Trigger TrajectoryPredictorAgent (background task)
            └── Fetch all sessions for this linkage
            └── Call Gemini 2.5 Flash with session trend data + mentor failure patterns
            └── Returns: trajectory, predicted_outcome, drop_probability, action
            └── Write prediction to linkage.trajectory in Firestore
            └── If declining/critical → push alert to dashboard feed

[FIRESTORE]
    │
    └── Real-time listener pushes linkage + trajectory updates to UI

[ADMIN UI — Linkages Table]
    └── Shows trajectory chip per row: Improving / Stable / Declining / Critical
    └── Trajectory panel in linkage detail modal with full prediction

[ADMIN UI — Agent Logs — Graph View]
    └── react-flow graph shows directed agent communication
        for selected matching run
        Nodes: Orchestrator, Mentor Agents, Risk Agent, Trajectory Predictor
        Edges: match request → fit score → risk report → proposal accepted
```

---

## 5. Environment Variables

```env
# Google Antigravity Project
GOOGLE_CLOUD_PROJECT=linkos-myhack-2026
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json

# Gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MAX_TOKENS=2048

# Vertex AI
VERTEX_EMBEDDING_MODEL=text-embedding-004
VERTEX_REGION=asia-southeast1

# Firestore
FIRESTORE_DATABASE=(default)

# Firebase (Frontend)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=linkos-myhack-2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=linkos-myhack-2026
VITE_FIREBASE_STORAGE_BUCKET=linkos-myhack-2026.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# App
API_BASE_URL=https://linkos-api-xxxx-as.a.run.app
FRONTEND_URL=https://linkos-demo.web.app
CORS_ORIGINS=["https://linkos-demo.web.app"]

# Feature Flags
ENABLE_SELF_REFLECTION=true
ENABLE_RISK_AGENT=true
ENABLE_REPLAY_MODE=true
ENABLE_TRAJECTORY_PREDICTOR=true
ENABLE_EVOLUTION_ENGINE=true
MIN_CLOUD_RUN_INSTANCES=1
```

---

## 6. Local Development Setup

```bash
# Clone and setup
git clone https://github.com/your-team/linkos
cd linkos

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd ../frontend
npm install
npm run dev

# Seed Firestore with demo data
cd ../backend
python scripts/seed_firestore.py

# Seed session logs for trajectory demo (pre-seeds a declining engagement)
python scripts/seed_sessions.py
```

---

## 7. Deployment Commands

```bash
# Deploy backend to Cloud Run
gcloud run deploy linkos-api \
  --source ./backend \
  --region asia-southeast1 \
  --min-instances 1 \
  --allow-unauthenticated \
  --project linkos-myhack-2026

# Deploy frontend to Firebase Hosting
cd frontend
npm run build
firebase deploy --only hosting
```
