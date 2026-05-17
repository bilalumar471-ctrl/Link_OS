# Goal Description
Implement a complete JWT authentication system with role-based access control (RBAC), a themed login page matching the "cyber-ecosystem" aesthetic, and seed test users. This involves backend changes to authenticate routes and generate JWTs, and frontend changes to securely store tokens, pass them on requests, and block unauthorized access via a `ProtectedRoute` wrapper.

## User Review Required
> [!IMPORTANT]
> The provided frontend code snippets are in TypeScript (`.ts` and `.tsx`), but the current project structure uses Javascript (`.js` and `.jsx`). I will adapt the provided TypeScript into JavaScript while retaining all logic exactly as specified. 
> 
> Also, to keep with the project's layout, backend routes might be inside different files than strictly named (e.g. `system.py` acts as `health.py` and `nl_query.py` per previous tasks, and `api/` is used instead of `routers/`). I will accurately map the RBAC wrappers to your existing files.

## Proposed Changes

### Backend
#### [MODIFY] [requirements.txt](file:///c:/Users/Admin/Link_OS/backend/requirements.txt)
- Add `python-jose[cryptography]==3.3.0`, `passlib[bcrypt]==1.7.4`, `python-multipart==0.0.9`.

#### [MODIFY] [.env](file:///c:/Users/Admin/Link_OS/backend/.env)
- Append JWT configuration keys (`JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRY_HOURS`).

#### [NEW] [auth.py](file:///c:/Users/Admin/Link_OS/backend/app/core/auth.py)
- Core authentication logic: JWT generation, verification, and RBAC dependency checkers (`require_roles`, `require_min_role`, `is_own_resource`).

#### [NEW] [auth.py](file:///c:/Users/Admin/Link_OS/backend/app/api/auth.py)
- Login route, `/me` route, logout route, and the seeded `TEST_USERS`. I will correctly hash the passwords to populate the dict. (Note: placing in `app/api/` to match the existing router structure).

#### [MODIFY] [main.py](file:///c:/Users/Admin/Link_OS/backend/app/main.py)
- Register the `auth` router and modify `CORSMiddleware` to allow `Authorization` headers.

#### [MODIFY] [match.py](file:///c:/Users/Admin/Link_OS/backend/app/api/match.py)
- Apply `require_roles("super_admin", "programme_admin")` to all routes.

#### [MODIFY] [stream.py](file:///c:/Users/Admin/Link_OS/backend/app/api/stream.py)
- Add `verify_stream_token` logic via `token` query parameter to manually authenticate SSE streams.

#### [MODIFY] [linkages.py](file:///c:/Users/Admin/Link_OS/backend/app/api/linkages.py)
- Apply `verify_token` and RBAC logic to all GET, POST, and DELETE endpoints per instructions.

#### [MODIFY] [entities.py](file:///c:/Users/Admin/Link_OS/backend/app/api/entities.py)
- Apply RBAC rules to all CRUD endpoints.

#### [MODIFY] [system.py](file:///c:/Users/Admin/Link_OS/backend/app/api/system.py)
- Apply RBAC rules to health, natural language queries, and stats endpoints.

---

### Frontend
#### [NEW] [auth.js](file:///c:/Users/Admin/Link_OS/frontend/src/lib/auth.js)
- Create `authService` for managing login state, localStorage, and token verification.

#### [MODIFY] [api.js](file:///c:/Users/Admin/Link_OS/frontend/src/lib/api.js)
- Migrate all `fetch` requests to a wrapper (`apiClient`) that injects the JWT token.
- Add `getStreamUrl` helper for SSE.

#### [NEW] [ProtectedRoute.jsx](file:///c:/Users/Admin/Link_OS/frontend/src/components/ProtectedRoute.jsx)
- Route wrapper that intercepts unauthenticated or unauthorized access and redirects appropriately.

#### [NEW] [UnauthorisedPage.jsx](file:///c:/Users/Admin/Link_OS/frontend/src/pages/UnauthorisedPage.jsx)
- Screen shown for RBAC blocks.

#### [NEW] [LoginPage.jsx](file:///c:/Users/Admin/Link_OS/frontend/src/pages/LoginPage.jsx)
- Beautiful, animated login page with test credentials panel exactly matching the design tokens provided.

#### [MODIFY] [App.jsx](file:///c:/Users/Admin/Link_OS/frontend/src/App.jsx)
- Wrap all standard routes in `ProtectedRoute` and register `/login` and `/unauthorised`.

## Verification Plan

### Automated Tests
- Run `python -m uvicorn app.main:app --reload` and verify backend boots successfully without errors.
- Ensure frontend builds and runs.

### Manual Verification
1. Open the application. Ensure the user is immediately redirected to `/login`.
2. Observe the animated login page. Check that clicking a test user row auto-fills the inputs.
3. Login as `mentor01` and verify the user cannot access `super_admin` features (e.g., triggering a match), but can view linkages. 
4. Login as `superadmin` and confirm full access.
