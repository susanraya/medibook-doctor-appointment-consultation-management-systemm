"""Public-to-any-signed-in-user doctor availability, and the admin-only
doctor status toggle (US-020).

Stubs only -- see `app.routers.auth` for why, except the status toggle, which
is implemented (AC-049).
"""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.deps import require_role
from app.errors import DOCTOR_NOT_FOUND
from app.models import User
from app.schemas import DoctorStatusOut, StubResponse
from app.services import update_doctor_status

router = APIRouter(tags=["doctors"])

_require_admin = Depends(require_role("admin"))
_db = Depends(get_db)


class _DoctorStatusBody(BaseModel):
    """PUT /admin/doctors/{doctor_id}/status's body (AC-049).

    Defined locally rather than in `app.schemas` because this sprint's own
    test cases name the field `status` (`"active"`/`"inactive"`), not the
    `is_active` boolean the original schema used.
    """

    status: Literal["active", "inactive"]


@router.get("/doctors/{doctor_id}/slots", response_model=StubResponse)
async def doctor_slots(doctor_id: str) -> StubResponse:
    return StubResponse(endpoint=f"GET /doctors/{doctor_id}/slots")


@router.put(
    "/admin/doctors/{doctor_id}/status",
    response_model=DoctorStatusOut,
    responses={
        DOCTOR_NOT_FOUND["status_code"]: {"description": DOCTOR_NOT_FOUND["detail"]},
    },
)
async def set_doctor_status(
    doctor_id: str,
    payload: _DoctorStatusBody,
    db: DBSession = _db,
    _admin: User = _require_admin,
) -> DoctorStatusOut:
    doctor = db.query(User).filter(User.id == doctor_id, User.role == "doctor").first()
    if doctor is None:
        raise HTTPException(
            status_code=DOCTOR_NOT_FOUND["status_code"], detail=DOCTOR_NOT_FOUND["detail"]
        )

    is_active = payload.status == "active"
    flagged_appointment_ids = update_doctor_status(db, doctor, is_active)
    return DoctorStatusOut(
        id=doctor.id,
        is_active=doctor.is_active,
        flagged_appointment_ids=flagged_appointment_ids,
    )
