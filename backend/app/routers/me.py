"""The signed-in user's own profile, consent, availability and appointments.

`/me/profile` is implemented (AC-014, AC-015); the rest are stubs -- see
`app.routers.auth` for why.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.deps import get_current_user
from app.errors import EMAIL_ALREADY_IN_USE
from app.models import User
from app.schemas import ProfileOut, ProfileUpdateRequest, StubResponse
from app.services import update_own_profile

router = APIRouter(tags=["me"])

_current_user = Depends(get_current_user)
_db = Depends(get_db)


def _profile_out(user: User) -> ProfileOut:
    return ProfileOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
    )


@router.get("/me/profile", response_model=ProfileOut)
async def get_profile(user: User = _current_user) -> ProfileOut:
    return _profile_out(user)


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


@router.post("/me/consent", response_model=StubResponse)
async def give_consent() -> StubResponse:
    return StubResponse(endpoint="POST /me/consent")


@router.put("/me/availability", response_model=StubResponse)
async def set_availability() -> StubResponse:
    return StubResponse(endpoint="PUT /me/availability")


@router.get("/me/appointments", response_model=StubResponse)
async def list_my_appointments() -> StubResponse:
    return StubResponse(endpoint="GET /me/appointments")
