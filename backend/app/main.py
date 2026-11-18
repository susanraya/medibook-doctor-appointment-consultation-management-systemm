"""Application entrypoint.

Generated from the approved architecture: one router per component that owns
endpoints, one route per endpoint the API spec declares. Every generated route
is a stub that returns a typed placeholder, so the service starts, serves its
OpenAPI document and passes its tests before a single handler is implemented.
"""

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import models  # noqa: F401 -- imported so the tables register before create_all
from app.database import Base, SessionLocal, engine
from app.routers import all_routers
from app.seed import seed_bootstrap_users
from app.services import configured_services

APP_DESCRIPTION = (
    "Develop a web-based healthcare appointment management application where patients "
    "can search for doctors based on their disease, symptoms, or medical specialization, "
    "view available doctors and their consultation time slots, and book, reschedule, or "
    "cancel appointments. Doctors can manage their availability, view scheduled "
    "appointments, maintain patient consultation records, and update consultation "
    "statuses. The system should support role-based access for patients, doctors, and "
    "administrators, with an admin dashboard to manage doctors, specializations, and "
    "appointments. The application must use predefined disease-to-specialization "
    "mappings to help patients find relevant doctors, without using AI, LLMs, or machine "
    "learning. It should prevent double bookings and display real-time appointment "
    "availability. No payment gateway or online payment functionality is required."
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """The scaffold ships no migrations, so the tables are created from the models
    when the application starts. Replace this with Alembic before anything holds data
    worth keeping.

    This runs on startup and not at import, so importing the application never opens a
    connection. A test can therefore point `get_db` at a database of its own, and a
    deployment whose `DATABASE_URL` names a server that is not up fails where you can
    read the error, not while pytest collects the files.

    Also seeds the two platform-provided accounts (bootstrap admin, smoke-test patient)
    -- idempotently, and only when their environment variables are set. See `app.seed`.

    `users` and `sessions` now have their own Alembic migration (0001); creating them
    here too would collide with `alembic upgrade head` on a database that has not
    create_all-ed them yet, so this only creates the tables that still have none.
    """
    _migrated_tables = {"users", "sessions"}
    _tables = [t for t in Base.metadata.sorted_tables if t.name not in _migrated_tables]
    Base.metadata.create_all(bind=engine, tables=_tables)
    db = SessionLocal()
    try:
        seed_bootstrap_users(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="MediBook – Doctor Appointment & Consultation Management Systemm",
    description=APP_DESCRIPTION,
    version="0.1.0",
    lifespan=lifespan,
)

# The SPA runs on a different origin than the API, so the browser refuses its calls
# unless that origin is allowed here. In development that is the Vite dev server; when
# deployed, the platform injects the frontend's real URL as ALLOWED_ORIGINS (comma
# separated). Point ALLOWED_ORIGINS at the real thing and nothing else has to change.
_dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins or _dev_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for _router in all_routers:
    app.include_router(_router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: object, exc: RequestValidationError
) -> JSONResponse:
    """Per-field {field, message} entries (AC-003), not FastAPI's default shape."""
    errors = []
    for err in exc.errors():
        loc = [str(part) for part in err["loc"] if part != "body"]
        errors.append({"field": ".".join(loc) or "body", "message": err["msg"]})
    return JSONResponse(status_code=422, content={"detail": errors})


@app.get("/health")
async def health() -> dict[str, object]:
    """Liveness probe, and the only route here that is not a stub."""
    return {"status": "ok", "services": configured_services()}
