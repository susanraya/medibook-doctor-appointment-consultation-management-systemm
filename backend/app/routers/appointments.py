"""Booking, rescheduling, cancelling and treating an appointment.

`POST /appointments` and `PUT /appointments/{id}/consultation` carry real
consent-gating behaviour (AC-016); the rest are stubs -- see
`app.routers.auth` for why. The real booking handler is where the
architecture's double-booking prevention will live: lock the target slot
`FOR UPDATE` inside one transaction before booking it.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.deps import get_current_user
from app.errors import CONSENT_REQUIRED
from app.models import Appointment, User
from app.schemas import StubResponse
from app.services import has_given_consent, record_audit_log, require_consent

router = APIRouter(tags=["appointments"])

_current_user = Depends(get_current_user)
_db = Depends(get_db)


@router.post(
    "/appointments",
    status_code=201,
    responses={
        CONSENT_REQUIRED["status_code"]: {"description": CONSENT_REQUIRED["detail"]},
    },
)
async def book_appointment(
    request: Request, user: User = _current_user, db: DBSession = _db
) -> dict:
    # AC-016: a patient who has not yet consented cannot proceed with booking.
    require_consent(db, user)

    raw = await request.json()
    slot_id = raw.get("slot_id") if isinstance(raw, dict) else None

    appointment = Appointment(patient_id=user.id, slot_id=slot_id, status="scheduled")
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return {
        "id": appointment.id,
        "slot_id": appointment.slot_id,
        "status": appointment.status,
    }


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
    # AC-016: consultation data cannot be saved while the appointment's own
    # patient has not yet consented -- regardless of which role is saving it
    # (the earlier per-caller check here was a no-op for the treating doctor).
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if appointment is not None and not has_given_consent(db, appointment.patient_id):
        raise HTTPException(
            status_code=CONSENT_REQUIRED["status_code"], detail=CONSENT_REQUIRED["detail"]
        )

    # NFR-007: every change is audit-logged.
    record_audit_log(db, user, action="update", entity_type="consultation_record", entity_id=id)
    return StubResponse(endpoint=f"PUT /appointments/{id}/consultation")


@router.put("/appointments/{id}/status", response_model=StubResponse)
async def update_appointment_status(id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /appointments/{id}/status")
