"""Booking, rescheduling, cancelling and treating an appointment.

Stubs only -- see `app.routers.auth` for why. The real handlers are where
the architecture's double-booking prevention lives: lock the target slot
`FOR UPDATE` inside one transaction before booking it.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.deps import get_current_user
from app.errors import CONSENT_REQUIRED
from app.models import User
from app.schemas import StubResponse
from app.services import record_audit_log, require_consent

router = APIRouter(tags=["appointments"])

_current_user = Depends(get_current_user)
_db = Depends(get_db)


@router.post(
    "/appointments",
    response_model=StubResponse,
    status_code=201,
    responses={
        CONSENT_REQUIRED["status_code"]: {"description": CONSENT_REQUIRED["detail"]},
    },
)
async def book_appointment(user: User = _current_user, db: DBSession = _db) -> StubResponse:
    # AC-016: a patient who has not yet consented cannot proceed with booking.
    require_consent(db, user)
    return StubResponse(endpoint="POST /appointments")


@router.put("/appointments/{id}/reschedule", response_model=StubResponse)
async def reschedule_appointment(id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /appointments/{id}/reschedule")


@router.post("/appointments/{id}/cancel", response_model=StubResponse)
async def cancel_appointment(id: str) -> StubResponse:
    return StubResponse(endpoint=f"POST /appointments/{id}/cancel")


@router.get("/appointments/{id}/consultation", response_model=StubResponse)
async def get_consultation(
    id: str, user: User = _current_user, db: DBSession = _db
) -> StubResponse:
    # NFR-007: every view of a consultation record is audit-logged.
    record_audit_log(db, user, action="view", entity_type="consultation_record", entity_id=id)
    return StubResponse(endpoint=f"GET /appointments/{id}/consultation")


@router.put(
    "/appointments/{id}/consultation",
    response_model=StubResponse,
    responses={
        CONSENT_REQUIRED["status_code"]: {"description": CONSENT_REQUIRED["detail"]},
    },
)
async def save_consultation(
    id: str, user: User = _current_user, db: DBSession = _db
) -> StubResponse:
    # AC-016: a patient who has not yet consented cannot proceed with saving
    # consultation-related data. NFR-007: every change is audit-logged.
    require_consent(db, user)
    record_audit_log(db, user, action="update", entity_type="consultation_record", entity_id=id)
    return StubResponse(endpoint=f"PUT /appointments/{id}/consultation")


@router.put("/appointments/{id}/status", response_model=StubResponse)
async def update_appointment_status(id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /appointments/{id}/status")
