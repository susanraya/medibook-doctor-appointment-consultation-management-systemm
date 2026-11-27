"""The signed-in user's own profile, consent, availability and appointments.

`/me/profile` and `/me/consent` are implemented (AC-014, AC-015, AC-016,
AC-017); the rest are stubs -- see `app.routers.auth` for why.

`/me/profile` and `/me/consent` return a plain dict rather than
`app.schemas.ProfileOut`/`ConsentOut` for the fields this sprint's own test
cases read (`consent_given`, `consent_given_at`): no OpenAPI spec exists yet
to confirm the exact field names against, and the schema module is not ours
to extend.
"""

from typing import Any

from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.deps import get_current_user
from app.errors import EMAIL_ALREADY_IN_USE
from app.models import PatientConsent, User
from app.schemas import ProfileOut, ProfileUpdateRequest, StubResponse
from app.services import record_consent, update_own_profile

router = APIRouter(tags=["me"])

_current_user = Depends(get_current_user)
_db = Depends(get_db)
_consent_body = Body(default=None)


def _profile_out(user: User) -> ProfileOut:
    return ProfileOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
    )


@router.get("/me/profile")
async def get_profile(user: User = _current_user, db: DBSession = _db) -> dict:
    consent = db.query(PatientConsent).filter(PatientConsent.patient_id == user.id).first()
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "consent_given": bool(consent is not None and consent.consented),
        "consent_given_at": consent.consented_at if consent is not None else None,
    }


@router.put(
    "/me/profile",
    response_model=ProfileOut,
    responses={
        EMAIL_ALREADY_IN_USE["status_code"]: {"description": EMAIL_ALREADY_IN_USE["detail"]},
    },
)
async def update_profile(
    payload: ProfileUpdateRequest,
    user: User = _current_user,
    db: DBSession = _db,
) -> ProfileOut:
    updated = update_own_profile(db, user, payload.full_name, payload.email, payload.phone)
    return _profile_out(updated)


@router.post("/me/consent", status_code=200)
async def give_consent(
    payload: dict[str, Any] | None = _consent_body,
    user: User = _current_user,
    db: DBSession = _db,
) -> dict:
    # Calling this endpoint as the signed-in patient is itself the explicit
    # acceptance (AC-016); no particular body is required.
    consent = record_consent(db, user)
    return {
        "consented": consent.consented,
        "consented_at": consent.consented_at,
        "consent_given": consent.consented,
        "consent_given_at": consent.consented_at,
    }


@router.put("/me/availability", response_model=StubResponse)
async def set_availability() -> StubResponse:
    return StubResponse(endpoint="PUT /me/availability")


@router.get("/me/appointments", response_model=StubResponse)
async def list_my_appointments() -> StubResponse:
    return StubResponse(endpoint="GET /me/appointments")
