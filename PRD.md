# LinkOS — Product Requirements Document (PRD)
**Version:** 1.2.0
**Hackathon:** Build With AI 2026 KL – MyHack
**Date:** 16–17 May 2026
**Platform:** Google Antigravity
**Team:** [Your Team Name]

---

## Changelog — v1.2.0
- FIX 1: Standardised Gemini model to `gemini-2.5-flash` throughout
- FIX 3: F9 (Self-Reflection) expanded with full spec; F10 (Risk Agent) remains F10; F11/F12 unchanged
- FIX 5: Post-mortem lifecycle diagram corrected — trigger now includes COMPLETED (rating < 3) and REASSIGNED, not only DROPPED
- FIX 6: Auth mechanism specified — Firebase Authentication with Google Sign-In

---

## 1. Executive Summary

LinkOS is a multi-agent AI platform that automates ecosystem relationship management for innovation programme operators. It replaces manual, ad-hoc coordination (matching mentors to companies, assigning companies to programmes, linking partners to initiatives) with a persistent, intelligent, self-improving system where every actor in the ecosystem is represented by its own AI agent with long-term memory.

Built for Cradle and similar innovation ecosystem operators, LinkOS treats relationships as first-class, programmable entities that can be created, stored, reused, governed, and improved automatically across programmes, cohorts, countries, and geographies.

LinkOS includes a **Relationship Trajectory Predictor** — a mid-engagement AI agent that forecasts where every active relationship is heading before it fails, and a **Cross-Cohort Evolution Engine** that predicts how mentor-company fit will change across future programme cycles. Together these close the gap between retrospective learning and genuine forward-looking intelligence.

---

## 2. Problem Statement

### 2.1 Background
Regional innovation ecosystems — accelerators, mentorship cohorts, funding platforms, and startup initiatives — depend on a network of actors: companies, mentors, partners, service providers, and programme administrators. Platforms like Cradle's MYStartup manage dozens of these programmes simultaneously across Malaysia and the broader region.

### 2.2 The Core Problem
Every time a new programme launches, administrators start from zero:
- Mentors are matched to companies manually, based on personal knowledge or spreadsheets
- Companies are assigned to programmes without structured eligibility checks
- Partner linkages are created as one-off decisions, not reusable records
- Past engagement outcomes — who performed well, who dropped out, what worked — are never captured in a format the system can learn from
- No mechanism exists to predict how an active relationship will evolve — problems are only visible after they become failures

The platform has no concept of a **relationship as a persistent entity**. Every linkage is ephemeral. Every programme resets institutional memory. And the system cannot see trouble coming.

### 2.3 Who Is Affected
| Stakeholder | Pain Point |
|---|---|
| Programme Administrators | Manual workload that doesn't scale across programmes |
| Mentors | Reassigned without consideration of past performance or domain fit |
| Companies | Matched with unsuitable mentors; no continuity across cohorts |
| Partners / Service Providers | Linked to wrong initiatives; no performance tracking |
| Ecosystem Owners (Cradle) | No intelligence across programmes; blind to systemic patterns; no early warning |

### 2.4 Why It Matters
- Manual coordination creates operational bottlenecks that slow ecosystem growth
- Without historical data, matching quality never improves
- Scaling across countries and programmes is impossible without automation
- Lost intelligence means the same mistakes get made in every new cohort
- Without predictive capability, engagements drop out before anyone sees it coming

---

## 3. Solution Overview

LinkOS introduces a **Multi-Agent Ecosystem Linkage Platform** where:

1. Every actor (mentor, company, programme, partner) has a dedicated **AI agent** that represents it
2. Agents maintain **persistent long-term memory** of every engagement — successes, failures, patterns, lessons
3. An **Orchestrator Agent** coordinates inter-agent communication and negotiation
4. Relationships are stored as **Linkage Entities** in Firestore — structured, reusable, versioned records
5. A **post-mortem engine** analyses failed or poor engagements and writes specific lessons back to the relevant agents
6. A **Trajectory Predictor Agent** monitors every active engagement mid-cycle and forecasts its outcome before failure occurs
7. A **Cross-Cohort Evolution Engine** predicts how mentor-company fit will shift across future programme cycles
8. A **System-Level Self-Reflection Engine** evaluates the platform's own matching accuracy after every programme cycle and adjusts future scoring weights
9. The system **learns and improves** with every completed programme cycle

### 3.1 The Agent Architecture

```
ADMIN
  │
  ▼
ORCHESTRATOR AGENT
  ├── reads Programme criteria
  ├── broadcasts match requests
  ├── collects agent responses
  ├── ranks and creates Linkage Entities
  ├── runs post-mortems after engagements close
  ├── triggers Trajectory Predictor after each session log
  └── triggers Self-Reflection Engine after programme cycle closes
       │
  ┌────┴────────────────────────────────────────────────────────┐
  │         │           │          │          │        │         │
MENTOR   COMPANY   PROGRAMME   PARTNER   TRAJECTORY  RISK  SELF-REFLECT
AGENT    AGENT     AGENT       AGENT     PREDICTOR   AGENT   ENGINE
  │         │           │          │          │
reads     reads       reads      reads    reads session
own       own         criteria   own      history →
history   history     from       history  forecasts
from      from        Firestore  from     outcome +
Firestore Firestore              Firestore trajectory
```

### 3.2 Linkage Entity Lifecycle

```
PROPOSED → ACTIVE → [SESSION LOGS] → COMPLETED (rating ≥ 3)
               │           │
               │     TRAJECTORY PREDICTOR runs after each session
               │     → writes predicted_outcome, drop_probability,
               │       trajectory, recommended_action to linkage
               │
               ├──→ COMPLETED (rating < 3) ─┐
               │                            ├──→ POST-MORTEM
               └──→ DROPPED ────────────────┤   → LESSONS WRITTEN
                                            │     BACK TO ALL
               └──→ REASSIGNED ────────────-┘     AFFECTED ACTORS
                     ↓
               NEW PROPOSED linkage created
               with prior context attached
```

**Post-mortem trigger conditions (all three):**
- Engagement outcome = `dropped`
- Engagement outcome = `reassigned`
- Engagement outcome = `completed` AND final rating < 3

---

## 4. Features & Requirements

### 4.1 Core Features

#### F1 — Multi-Agent Matching Engine
**Priority:** P0 (Must have)

- Programme Agent broadcasts matching criteria (sector, stage, expertise needed)
- All eligible Mentor Agents receive the request and evaluate it
- Each Mentor Agent computes a fit score using:
  - Vertex AI text embeddings (semantic profile similarity)
  - Historical performance data (past ratings, completion rates, domain-specific success)
  - Failure pattern flags (known weaknesses that contradict the match request)
- Agents return scored proposals with explicit reasoning
- Orchestrator ranks proposals and creates Linkage Entities
- Human admin reviews and confirms before status changes to `active`

#### F2 — Persistent Actor Memory
**Priority:** P0 (Must have)

Every actor entity in Firestore maintains three data layers:

**Profile Layer (static):**
- Name, expertise tags, sector focus, region, stage preference
- Embedded as Vertex AI text embedding vector for semantic search

**Performance Layer (computed, updated after each engagement):**
- `avg_rating`: weighted average across all engagements
- `completion_rate`: completed / total engagements
- `session_attendance`: sessions completed / sessions scheduled
- `domain_match_score`: how often matched to the right domain
- `strength_tags`: domains where consistently rated 4+
- `weakness_tags`: domains where consistently underperforming
- `failure_patterns`: AI-generated text descriptions of recurring failure scenarios

**History Layer (append-only):**
- One document per engagement
- Contains: company/mentor ID, programme ID, period, outcome, ratings, notes, flags, sessions completed/missed

#### F3 — AI-Powered Post-Mortem Engine
**Priority:** P0 (Must have)

When an engagement ends with outcome `dropped`, `reassigned`, or rating < 3:
- Orchestrator triggers a post-mortem Gemini 2.5 Flash call
- Gemini analyses the mentor profile snapshot, company profile snapshot, ratings, and notes
- Returns structured JSON: `{ failure_tags, avoid_pairing_with, lesson }`
- Lessons written back to mentor's `performance.failure_patterns` and `performance.weakness_tags`
- Post-mortem result stored in the Linkage Entity for audit trail

#### F4 — Explainable Decisions with Evidence Citation
**Priority:** P0 (Must have)

Every match proposal must include:
- Fit score (0–100)
- Reasoning paragraph citing specific history data
- Risk flags (e.g. "Mentor has dropped 2 of 3 pre-seed engagements")
- Confidence indicator (High / Medium / Low based on data richness)
- Alternative suggestions if primary match has known risks

This is required for the Ethical AI criteria in the rubric — the system explains every decision, never operates as a black box.

#### F5 — Live Agent Reasoning Log (Demo Feature)
**Priority:** P0 (Must have for demo)

A real-time streaming panel in the UI that shows:
- Which agents are active
- Each agent's reasoning steps as they evaluate a match
- Inter-agent messages (what Programme Agent requested, how Mentor Agent responded)
- Final Orchestrator decision with ranking

Powered by Gemini 2.5 Flash streaming responses via Server-Sent Events (SSE). This is the primary demo differentiator — judges watch agents negotiating in real time.

#### F6 — Natural Language Admin Interface
**Priority:** P1 (Should have)

Admin can type in plain English:
- "Find me a fintech mentor for a Series A company in KL"
- "Which mentors have succeeded with hardware startups?"
- "Show me all engagements that dropped in cohort 3"

A dedicated NL Interface Agent interprets the query, breaks it into Firestore operations, and returns structured results with a natural language summary.

#### F7 — Engagement Health Monitor
**Priority:** P1 (Should have)

During active engagements, the system monitors:
- Session attendance rate (pulled from engagement logs)
- Rating trend (early check-in ratings)
- Response time between mentor and company
- Flags at-risk engagements before they formally drop out
- Sends proactive alert to admin: "Engagement between [Mentor] and [Company] shows early warning signs — 2 missed sessions, last rating 2.8"

#### F8 — Cross-Programme Relationship Reuse
**Priority:** P1 (Should have)

When a new programme is created:
- System queries existing Linkage Entities for historically successful pairings that match the new programme's criteria
- Suggests proven mentor-company matches from past cohorts
- Admin can accept suggestions directly without running full matching again
- Reuse rate becomes a platform KPI

#### F9 — System-Level Self-Reflection Engine
**Priority:** P1 (Should have)

After every programme cycle closes, the Orchestrator triggers a system-level self-reflection cycle that evaluates the performance of the matching engine itself — not individual actors.

**When it runs:**
Automatically triggered when a programme's final linkage moves to `completed` or `dropped` and the programme cycle is marked closed.

**What it analyses:**
- Predicted fit scores at match time vs actual final ratings
- Which agent proposals the admin overrode (and whether the override led to better or worse outcomes)
- Whether any sector, stage, or demographic was systematically scored lower than outcome data justifies (bias detection)
- Which failure patterns correctly predicted dropout vs which were false positives

**Output written to Firestore `/system/self_reflection/{cycle_id}`:**
```json
{
  "programme_id": "ref",
  "predicted_scores": { "linkage_id": "predicted_score" },
  "actual_outcomes": { "linkage_id": "final_rating" },
  "prediction_accuracy": 0.82,
  "bias_observations": ["Fintech companies systematically scored 8pts lower than outcomes justify"],
  "weight_adjustments": { "fintech_domain": 0.05, "pre_seed_stage": -0.03 },
  "reflection_summary": "string",
  "reflection_at": "timestamp"
}
```

**How it improves future matching:**
The `weight_adjustments` output is read by the Orchestrator Agent at the start of every new matching cycle. Domains that were systematically under-scored get a positive weight adjustment; over-confident predictions get a confidence penalty applied to similar future match types.

**Ethical safeguard:**
Bias observations are surfaced in the Analytics page. If the same sector or stage appears in `bias_observations` for 2+ consecutive cycles, a warning banner appears in the admin dashboard.

#### F10 — Risk Agent
**Priority:** P1 (Should have)

A dedicated risk analysis agent that:
- Evaluates every proposed linkage before it goes to admin review
- Checks for known failure patterns, conflict-of-interest flags, overloaded mentors
- Returns a risk report alongside the match proposal
- Admin sees: Match Score + Risk Score together
- If risk level is HIGH, match is flagged for mandatory admin review before activation

#### F11 — Relationship Trajectory Predictor
**Priority:** P0 (Must have for demo)

The system predicts where every active engagement is heading — before it fails. This closes the gap between retrospective learning (post-mortem) and forward-looking intelligence (prediction).

**How it works:**
After every session is logged by the admin, the Orchestrator automatically triggers a Trajectory Predictor Gemini 2.5 Flash call. The agent analyses the trend across all sessions completed so far and outputs a structured forecast.

**Session Log Subcollection (Firestore):**
```
/linkages/{linkage_id}
  └── /sessions/{session_id}
        ├── session_number: int
        ├── date: timestamp
        ├── attended: boolean
        ├── rating: float (1–5)
        ├── response_time_hours: float
        ├── notes: string
        └── logged_at: timestamp
```

**Trajectory Prediction Output (written back to linkage):**
```json
{
  "trajectory": "declining",
  "predicted_final_rating": 2.4,
  "predicted_outcome": "drop",
  "drop_probability": 0.78,
  "predicted_drop_week": 6,
  "confidence": "high",
  "trajectory_reason": "Ratings fallen from 4.5 to 3.1 across 3 sessions with increasing response time, matching pattern of 2 prior drops for this mentor",
  "recommended_action": "Schedule admin check-in within 48 hours. Consider reassignment if next rating drops below 3.0.",
  "action_urgency": "immediate"
}
```

**Trigger conditions:**
- Runs automatically after every session log entry (requires 2+ sessions for trend analysis)
- Result stored in `linkage.trajectory` field in Firestore
- If trajectory moves to `declining` or `critical`, Orchestrator pushes an alert to the admin dashboard feed in real time

**What makes this different from F7 (Health Monitor):**
- F7 detects current problems (reactive)
- F11 predicts future outcomes with probability and timeline (proactive)
- F11 references the mentor's historical failure patterns to identify whether the current trend matches past drop signatures

**Firestore field added to linkage document:**
```
/linkages/{linkage_id}
  └── trajectory: {
        status: "improving" | "stable" | "declining" | "critical",
        predicted_final_rating: float,
        predicted_outcome: "completed" | "drop" | "reassignment_needed",
        drop_probability: float,
        predicted_drop_week: int | null,
        confidence: "high" | "medium" | "low",
        trajectory_reason: string,
        recommended_action: string,
        action_urgency: "immediate" | "this_week" | "monitor",
        last_computed_at: timestamp
      }
```

#### F12 — Cross-Cohort Evolution Engine
**Priority:** P1 (Should have)

Predicts how a mentor-company relationship's fit will change across future programme cohorts — not just within the current engagement.

**When it runs:** Automatically triggered by the Orchestrator when a programme cycle closes and a linkage moves to `completed`.

**What it analyses:**
- How has the company grown? (stage progression across cohorts)
- How has the mentor's domain match quality trended over the same period?
- Are the two actors growing at compatible rates?

**Output written to linkage:**
```
/linkages/{linkage_id}
  └── evolution_forecast: {
        forecast_generated_at: timestamp,
        cohort_fit_scores: {
          "cohort_3": 84,
          "cohort_4": 61,
          "cohort_5": 43
        },
        mismatch_predicted_at_cohort: 4,
        forecast_reason: string,
        recommended_action: string
      }
```

---

## 5. User Stories

### Admin / Programme Manager
- As an admin, I want to run matching for a new cohort in one click so that I don't spend days manually coordinating
- As an admin, I want to see why a specific mentor was recommended so that I can trust the decision
- As an admin, I want to be alerted when an engagement is at risk so that I can intervene early
- As an admin, I want to know the predicted outcome of an active engagement before it fails so that I can act before the drop happens
- As an admin, I want to search using plain English so that I don't need to learn a complex query language

### Mentor
- As a mentor, I want my past performance to be accurately reflected in future assignments so that I'm matched to companies I can genuinely help
- As a mentor, I want my domain specialisations to be respected so that I'm not assigned outside my expertise

### Company / Startup
- As a company, I want to be matched with a mentor who has a proven track record with companies at my stage so that I get relevant guidance
- As a company, I want early signals if my mentorship engagement is deteriorating so that adjustments can be made before the relationship breaks down

### Ecosystem Owner (Cradle)
- As Cradle, I want cross-programme intelligence so that insights from one cohort improve future cohorts automatically
- As Cradle, I want the system to predict relationship trajectories so that dropout rates are reduced proactively
- As Cradle, I want a deployment-ready platform that can scale across Malaysia and internationally

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Agent matching chain must complete within 15 seconds for up to 20 mentors
- UI must stream agent reasoning with < 500ms latency from first token
- Firestore queries must return in < 200ms for standard entity reads
- Trajectory Predictor must return a result within 5 seconds of session log submission

### 6.2 Reliability
- Replay mode: last successful matching run cached and replayable from UI
- All agent responses validated against JSON schema before writing to Firestore
- Graceful degradation: if one agent fails, Orchestrator skips and continues with remaining agents
- Trajectory Predictor failure is non-blocking — session log still saves even if prediction call fails

### 6.3 Ethical AI Compliance
- Human confirmation required before any linkage moves from `proposed` to `active`
- All AI decisions include reasoning — no opaque scores
- Trajectory predictions include confidence indicators and explicit reasoning — never a bare probability
- Bias monitoring: Self-Reflection Engine (F9) flags if the same demographic or sector is systematically scored lower
- Bias warnings surfaced in Analytics dashboard after 2+ consecutive flagged cycles
- Data privacy: mentor and company profiles are not shared with each other's agents directly — only through the Orchestrator

### 6.4 Authentication
- **Method:** Firebase Authentication — Google Sign-In (OAuth 2.0)
- All routes except `/login` are protected via a `<ProtectedRoute>` component
- Unauthenticated users are redirected to `/login`
- Demo: pre-authenticate with team Google account before presentation; Firebase auth state persists across browser sessions

### 6.5 Scalability
- Firestore horizontal scaling — no schema changes required to add a new region or programme type
- Agent architecture is stateless — new entity types (e.g. investors) can be added by defining a new agent system prompt and Firestore collection
- Cloud Run auto-scales FastAPI backend with zero configuration changes
- Trajectory Predictor runs as an async background task — does not block the session log API response

---

## 7. Success Metrics

| Metric | Target |
|---|---|
| Matching time reduction | 90% vs manual process |
| Linkage reuse rate across programmes | > 30% of matches reused from history |
| Engagement completion rate | > 85% (vs estimated 60–70% manual) |
| Trajectory prediction accuracy | > 70% correct outcome prediction (drop vs complete) |
| Early intervention rate | > 50% of at-risk engagements receive admin action before formal drop |
| Admin satisfaction | Judges score Working Demo ≥ 8/10 |
| Google Tech integration score | 14–15/15 |
| Problem-Solution Fit score | 14–15/15 |

---

## 8. Out of Scope (for 24-hour hackathon)

- Mobile app (web responsive only)
- Real-time video/chat between mentors and companies
- Financial transaction management
- Integration with existing Cradle databases (demo uses seeded data)
- Full multi-tenant role management (demo uses single admin Google account)

---

## 9. Assumptions & Constraints

- Firestore is pre-seeded with 6 mentors, 4 companies, 2 programmes before demo
- At least 2 active linkages are pre-seeded with session logs (3 sessions each) to demonstrate the Trajectory Predictor live
- One pre-seeded linkage must have a declining trajectory (ratings falling, increasing response time) for demo impact
- Gemini 2.5 Flash API keys provisioned under Google Antigravity project
- Vertex AI Embeddings API enabled on the same project
- Cloud Run deployment completed by hour 16 of the hackathon
- Demo is run live — replay mode is available as fallback
- Firebase Authentication configured with Google Sign-In for demo login

---

## 10. Hackathon Rubric Alignment

| Criteria | Points | How LinkOS Scores |
|---|---|---|
| Google Technology Integration | 15 | Vertex AI embeddings + Gemini 2.5 Flash function calling + Gemini 2.5 Flash streaming + Firestore + Cloud Run + Firebase Auth + Firebase Hosting — full Google stack, each justified |
| AI Implementation Quality | 10 | Multi-agent architecture, explainable decisions, human confirmation gate, post-mortem learning, trajectory prediction with confidence indicators, self-reflection bias detection, structured JSON outputs for hallucination mitigation |
| Working Demo & UI/UX | 10 | Live reasoning log, trajectory chips on linkages table, pre-seeded data, replay mode fallback, hosted URL on Cloud Run, Google Sign-In |
| AI Model Performance | 5 | History-aware scoring, embedding cosine similarity, performance-weighted match ranking, mid-engagement trajectory forecasting |
| Originality & Creativity | 10 | Multi-agent negotiation + predictive trajectory + cross-cohort evolution forecasting — unique combination in this problem space |
| Problem-Solution Fit | 15 | Every pain point in Cradle's problem statement maps directly to a specific system feature |
| Scalability | 10 | Firestore horizontal scaling, stateless agents, multi-region ready, async background tasks |
| Deployment Readiness | 5 | Cloud Run + Firebase Hosting + Firebase Auth — production-grade full Google stack |
| **Total** | **80** | **Target: 74–79 / 80** |
