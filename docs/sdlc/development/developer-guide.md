# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `7e12986` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
MediBook is a generated two-part healthcare appointment platform: a Vite + React 19 single-page frontend with fully designed, approved screens (currently running on seeded sample data), and a FastAPI 0.115 backend that is still a bare scaffold -- it exposes only a `/health` endpoint and the SQLAlchemy/engine plumbing needed for future routes and models. The backend defaults to a local SQLite file so it runs with no external services, while docker-compose provides a Postgres 16 and Redis 7 container for when the approved Postgres/AWS architecture is implemented. The frontend talks to the API through a single `apiFetch` helper in `src/lib/api.ts` that is not yet wired into any screen.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js 20+ (for Vite 6 / React 19 / TypeScript 5.6 tooling)
- Python 3.12
- pip
- Docker and Docker Compose (optional, for Postgres/Redis via docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository
2. Copy .env.example to .env and adjust values as needed
3. Backend: cd backend && pip install -r requirements.txt
4. Frontend: cd frontend && npm install
5. (Optional) From the repo root, run docker-compose up -d to start Postgres and Redis containers
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| backend dev server | `cd backend && uvicorn app.main:app --reload` | Starts the FastAPI app with auto-reload; creates SQLite tables on startup and serves /health |
| frontend dev server | `cd frontend && npm run dev` | Starts the Vite dev server for the React SPA |
| frontend build | `cd frontend && npm run build` | Bundles the app for production (does not typecheck) |
| frontend preview | `cd frontend && npm run preview` | Serves the production build locally |
| docker services | `docker-compose up -d` | Starts Postgres 16 and Redis 7 containers defined in docker-compose.yml |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `backend/app` | FastAPI application: entrypoint (main.py), DB engine/session (database.py), SQLAlchemy models, Pydantic schemas, routers package, and services |
| `backend/tests` | Unit and integration tests (pytest), including the health-check integration test |
| `frontend/src` | React application source: screens, shared lib (api client, UI components, icons, brand tokens), App shell and entrypoint |
| `frontend/e2e` | Playwright end-to-end specs and support helpers |
| `.devcontainer` | VS Code devcontainer configuration for a consistent dev environment |
| `.quorq` | Quorq AI SDLC platform metadata (handoff.json) |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend routers are generated one per architecture component that owns endpoints, with routes starting as typed stub responses (StubResponse) until implemented
- Pydantic schemas live in schemas.py, paired per entity with the SQLAlchemy models in models.py
- Database tables are created from models at app startup via Base.metadata.create_all, not via migrations
- DATABASE_URL defaults to local SQLite so the backend runs without an external database
- CORS origins are configured via the ALLOWED_ORIGINS env var, falling back to the Vite dev server origins
- Frontend screens live one module per screen under src/screens/, routed from App.tsx
- Shared frontend UI vocabulary lives in src/lib/ui.tsx and src/lib/icons.tsx; brand tokens in src/lib/brand.ts and index.css
- Frontend path alias @/ maps to src/ (configured in vite.config.ts and tsconfig.json)
- All API calls go through the single apiFetch helper in src/lib/api.ts, which attaches a bearer token (session token or shared API secret) and prefixes VITE_API_BASE_URL
- Vitest component tests sit beside the components they test; Playwright e2e specs live separately under e2e/
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend unit/integration tests | `cd backend && pytest` | Runs pytest against backend/tests (pythonpath set via pytest.ini) |
| backend lint | `cd backend && ruff check .` | Lints the backend Python code |
| backend format check | `cd backend && ruff format .` | Formats backend Python code with ruff |
| frontend unit tests | `cd frontend && npm test` | Runs Vitest component tests under src/ |
| frontend lint | `cd frontend && npm run lint` | Runs ESLint over the frontend app |
| frontend typecheck | `cd frontend && npm run typecheck` | Runs tsc --noEmit (not covered by npm run build) |
| frontend e2e | `cd frontend && npm run test:e2e:install && npm run test:e2e` | Installs the Playwright browser then runs e2e specs from e2e/, booting backend and frontend locally unless E2E_BASE_URL is set |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Frontend cannot reach the API / CORS errors in the browser console | Set ALLOWED_ORIGINS on the backend to include the frontend's origin, and VITE_API_BASE_URL on the frontend to point at the backend |
| Screens show sample data instead of real data even though the backend is running | Expected: the generated screens are approved against seeded sample data and are not yet wired to apiFetch/the backend |
| `pytest` fails with ModuleNotFoundError: app | Run pytest from the backend/ directory so pytest.ini's pythonpath = . takes effect |
| Playwright e2e tests fail to start the backend | Ensure backend dependencies are installed (the config expects a backend/.venv with uvicorn available), or set E2E_BASE_URL to run against an already-deployed instance |
| `npm run build` succeeds but deployment/type errors appear later | Run npm run typecheck (tsc --noEmit) separately, since build does not typecheck |
<!-- sdlc:auto:end troubleshooting -->
