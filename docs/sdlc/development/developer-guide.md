# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `f747e1e` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
MediBook is a two-part, AI SDLC-platform-generated healthcare appointment management system: a Vite + React 19 single-page frontend with approved, reviewed screens that currently render seeded sample data, and a FastAPI 0.115 backend that has only its health check implemented (the rest of the API is stub routes returning a typed 'not_implemented' placeholder, scaffolded from an approved API spec so the service starts and documents its OpenAPI shape before handlers are written). The backend uses SQLAlchemy over SQLite by default (swappable to Postgres via an env var) with tables created at startup rather than via migrations. A docker-compose file provisions Postgres and Redis for local infrastructure, though the backend runs standalone against SQLite with zero external services.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for Vite 6 / React 19 frontend tooling)
- Python 3.12
- pip
- Docker and Docker Compose (optional, for Postgres/Redis via docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository.
2. Backend: cd backend && pip install -r requirements.txt
3. (Optional) Start Postgres/Redis locally: from the repo root run docker-compose up -d
4. (Optional) Point the backend at Postgres by setting DATABASE_URL (defaults to sqlite:///./app.db if unset)
5. (Optional) Set ALLOWED_ORIGINS if the frontend will run on an origin other than http://localhost:5173 / http://127.0.0.1:5173
6. Run the backend: cd backend && uvicorn app.main:app --reload
7. Frontend: cd frontend && npm install
8. (Optional) Set VITE_API_BASE_URL / VITE_API_SECRET_KEY if pointing the frontend at a non-default backend URL
9. Run the frontend: cd frontend && npm run dev
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| frontend dev | `npm run dev` | Starts the Vite dev server for the React SPA. |
| frontend build | `npm run build` | Bundles the app with Vite (does not typecheck). |
| frontend preview | `npm run preview` | Serves the production build locally. |
| frontend typecheck | `npm run typecheck` | Runs tsc --noEmit to catch type errors the build step skips. |
| backend dev | `uvicorn app.main:app --reload` | Runs the FastAPI service with auto-reload, from the backend/ directory. |
| docker compose up | `docker-compose up -d` | Starts the Postgres (db) and Redis (redis-queue) containers defined at the repo root. |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `.devcontainer` | VS Code devcontainer configuration for a consistent dev environment. |
| `.quorq` | Quorq AI SDLC platform handoff metadata (not application code). |
| `backend` | FastAPI service: entrypoint, database setup, models, schemas, services, routers, and tests. |
| `backend/app` | Application package: main.py (FastAPI app/lifespan), database.py (engine/session), models.py (SQLAlchemy models, currently empty), schemas.py (Pydantic models, incl. stub response), services.py, routers/ (one router per architecture component). |
| `backend/tests` | pytest suite split into unit/ and integration/ (currently a health-check integration test). |
| `frontend` | Vite + React 19 SPA: approved, reviewed screens running on seeded sample data, plus build/lint/test tooling. |
| `frontend/src` | Application source: entrypoint (main.tsx), shared lib (api.ts, ui.tsx, icons.tsx, navigate.ts), global styles (index.css), test setup. |
| `frontend/e2e` | Playwright end-to-end specs and support helpers run against the built frontend and backend. |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend routers are generated one per architecture component that owns endpoints, with one route per spec'd endpoint; unimplemented routes return a typed StubResponse (status 'not_implemented') rather than erroring, so the service stays startable and its OpenAPI doc complete.
- SQLAlchemy models all inherit from the shared Base in app/database.py; main.py imports app.models before calling Base.metadata.create_all so new tables register automatically.
- No migration tool is wired up yet; schema is created from models at app startup via a lifespan handler.
- Backend database location is controlled by the DATABASE_URL env var, defaulting to a local SQLite file so the service runs with no external database.
- CORS allowed origins come from the ALLOWED_ORIGINS env var (comma-separated), falling back to the Vite dev server origins.
- Frontend imports use the '@/' path alias mapped to src/ (configured in both vite.config.ts and tsconfig.json).
- Frontend screens currently render seeded/sample data; src/lib/api.ts (apiFetch, API_BASE_URL, session token helpers) is the designated seam for wiring a screen to the real backend one at a time.
- apiFetch sends a Bearer token: a stored session token if present, otherwise the shared API_SECRET_KEY baked in at build time.
- Backend linting/formatting uses ruff (ruff.toml); frontend uses ESLint (eslint.config.js) and Prettier (.prettierrc).
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| frontend unit tests | `npm run test` | Runs Vitest component tests colocated with the components they cover. |
| frontend e2e install | `npm run test:e2e:install` | Installs the Chromium browser Playwright needs before running e2e specs. |
| frontend e2e tests | `npm run test:e2e` | Runs Playwright specs from e2e/; without E2E_BASE_URL it boots the backend (from backend/.venv) and a built/previewed frontend automatically. |
| frontend lint | `npm run lint` | Runs ESLint over the frontend app. |
| backend tests | `pytest` | Runs the pytest suite (tests/unit and tests/integration) from the backend/ directory, per pytest.ini. |
| backend lint | `ruff check .` | Lints the backend codebase with ruff. |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| `npm run build` succeeds but `tsc` would fail, or deployment fails on a type error that didn't show up locally. | Run `npm run typecheck` (tsc --noEmit) separately; `vite build` does not typecheck. |
| `pytest` run from the repo root fails with `ModuleNotFoundError: No module named 'app'`. | Run pytest from inside backend/ (where pytest.ini sets pythonpath = . and testpaths = tests). |
| Frontend API calls are blocked by CORS when the SPA runs on a non-default origin. | Set the backend's ALLOWED_ORIGINS env var to a comma-separated list including that origin before starting uvicorn. |
| All backend endpoints except /health return a generic 'not_implemented' body. | This is expected: no architecture/handlers were approved yet for the backend, so every other route is a stub returning StubResponse. |
| Playwright e2e run fails to start the backend leg. | Ensure backend dependencies are installed into backend/.venv (the webServer config in playwright.config.ts expects `backend/.venv/bin/python`), or set E2E_BASE_URL to point at an already-running deployment instead. |
<!-- sdlc:auto:end troubleshooting -->
