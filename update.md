# Link_OS: Multi-Agent Ecosystem Platform
**Project Status:** Active Development / Functional Prototype
**Tech Stack:** React (Vite) Frontend, FastAPI (Python) Backend, Firebase Firestore Database, Google Vertex AI & Gemini 2.0.

---

## 🚀 Project Overview
Link_OS is an advanced, AI-driven platform designed to manage and optimize ecosystem relationships—specifically matching Mentors with Companies within specific Programmes. Rather than relying on simple keyword matching, Link_OS deploys a **Multi-Agent Swarm** to analyze deep psychological and structural compatibilities, continuously monitoring engagements, and predicting failures before they happen.

---

## ✨ Core Features & How They Work

### 1. Role-Based Access Control (RBAC) & Authentication
**Where to find it:** The `app/core/auth.py` backend module, `app/api/auth.py`, and the frontend `lib/auth.js`.
**How it works:**
The entire ecosystem is locked down via stateless JSON Web Tokens (JWT).
- **User Roles:** Features a strict 5-tier role hierarchy (`super_admin`, `programme_admin`, `mentor`, `company`, `partner`).
- **Dynamic User Interface:** The React frontend automatically adapts to the user's role. For example, `company` users only see their relevant registration tabs, and `mentor` users cannot trigger ecosystem matches or view admin dashboards.
- **Resource Ownership:** Mentors and Companies are restricted to modifying only their own profile data (linked via `entity_id`), enforced dynamically at the API route level.
- **Secure SSE:** The live reasoning logs from the AI swarm are protected via query-parameter token injection, bypassing browser `EventSource` header limitations.

### 2. User Management System
**Where to find it:** The "Users" page in the UI (Super Admin only).
**How it works:**
A fully persistent identity provider built on top of Firestore.
- **Auto-Seeding:** On first boot, the FastAPI backend automatically seeds default demo accounts across different roles if they don't exist in the database.
- **Admin Dashboard:** Super Admins can list, create, and revoke user access dynamically without needing backend restarts. Passwords are securely hashed via `bcrypt` / `passlib`.

### 3. The Multi-Agent Matching Engine
**Where to find it:** The "Matching" page in the UI.
**How it works:** 
When an admin enters a Programme ID and triggers a match, the backend wakes up the **Orchestrator Agent**.
- The Orchestrator uses **Google Vertex AI** to create a mathematical "Semantic Embedding" of the company's needs and the programme's criteria.
- It then unleashes two sub-agents concurrently for every available mentor:
  - **Mentor Agent:** Uses **Gemini 2.0 Flash** to evaluate the semantic fit between the mentor's expertise and the company's specific needs, generating a quantitative `fit_score`.
  - **Risk Agent:** Simultaneously scans the potential pairing for historical failure patterns, personality clashes, or dropout risks.
- **Live Streaming:** As these agents "think", their internal reasoning logs are streamed live via Server-Sent Events (SSE) directly to the frontend's terminal window.
- The Orchestrator ranks the results and saves the Top 3 best matches to the database as "Proposed" linkages.

### 4. Trajectory Predictor & Live Telemetry
**Where to find it:** The "Overview" (Hero) page.
**How it works:**
Link_OS doesn't just make introductions; it tracks them. 
- The **Trajectory Predictor Agent** acts as an early warning system. Every time a session log is recorded between a mentor and a company, this agent analyzes the sentiment and outcomes.
- It dynamically assigns a trajectory status: `improving`, `stable`, `declining`, or `critical`.
- The frontend fetches all `active` linkages in real-time and calculates the **System Health** (average fit score across the ecosystem) and the **At-Risk Count**.
- Engagements with a `critical` or `declining` status are automatically floated to the top of the Live Telemetry panel for immediate admin intervention.

### 5. Ecosystem Dashboard & State Management
**Where to find it:** The "Dashboard" page.
**How it works:**
A comprehensive admin view of every linkage ever generated in the system.
- Fetches the entire ecosystem database from Firestore in a single, optimized load to prevent layout shifts.
- Displays global, live statistics at the top: **Total Linkages, Active, Proposed, and Avg Fit Score**.
- Admins can instantly filter the data table (e.g., viewing only "active" or "dropped" linkages) locally on the frontend without messing up the global statistics.
- **Lifecycle Management:** Admins can transition linkages through their lifecycle by clicking "Confirm" (moves from Proposed to Active) or "Close" (moves from Active to Completed).

### 6. Post-Mortem & Self-Reflection Engines (Background Tasks)
**Where to find it:** Backend (`post_mortem.py`, `self_reflection.py`, `evolution.py`).
**How it works:**
Link_OS is designed to be self-improving.
- If an admin closes an active linkage as "dropped", "reassigned", or rates it poorly (under 3.0), the backend automatically triggers the **Post-Mortem Engine** in the background.
- This engine analyzes the entire history of the linkage to figure out exactly *why* it failed.
- The **Self-Reflection Engine** periodically reviews completed programme cycles, comparing the AI's initial predicted fit scores against the actual real-world outcomes to identify and correct internal biases.

### 7. Natural Language Interface
**Where to find it:** Backend API (`/api/nl/query`).
**How it works:**
Instead of building dozens of complex reporting dashboards, Link_OS features an **NLInterfaceAgent**. This allows admins to query the database using plain English (e.g., *"Which mentors have the highest drop rate?"* or *"Show me all at-risk linkages in the FinTech programme"*). The agent translates this into exact database queries and formats the results.

---

## 🛠️ Technical Details & Architecture

- **Backend Structure:** Built with FastAPI. Uses a custom Data Access Layer (`app/services/dal.py`) to abstract all Firebase Firestore interactions. Agents are modularized in `app/agents/` to ensure clean separation of concerns.
- **Frontend Structure:** Built with React and Vite. Uses Framer Motion for premium, highly dynamic micro-animations. Designed with a dark-mode "cyber-ecosystem" aesthetic using custom color tokens.
- **Security:** JWT-based authentication system (`python-jose`) with strict RBAC middleware. User credentials hashed securely using `passlib` and `bcrypt`.
- **Authentication Credentials:** Relies on Google Cloud Service Account credentials (`GOOGLE_APPLICATION_CREDENTIALS`) managed via a local `.env` file to securely access Firestore and Vertex AI.
- **Data Models:** Strictly enforced using Pydantic on the backend to ensure the AI always returns properly structured JSON schemas, preventing parsing errors during agent swarming.

---

*This document was auto-generated to reflect the exact state of the Link_OS project.*
