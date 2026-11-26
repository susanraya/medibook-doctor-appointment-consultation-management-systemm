"""The signed-in user's own profile, consent, availability and appointments.

Stubs only -- see `app.routers.auth` for why.
"""

from fastapi import APIRouter

from app.schemas import StubResponse

router = APIRouter(tags=["me"])


@router.get("/me/profile", response_model=StubResponse)
async def get_profile() -> StubResponse:
    return StubResponse(endpoint="GET /me/profile")


@router.put("/me/profile", response_model=StubResponse)
async def update_profile() -> StubResponse:
    return StubResponse(endpoint="PUT /me/profile")


@router.post("/me/consent", response_model=StubResponse)
async def give_consent() -> StubResponse:
    return StubResponse(endpoint="POST /me/consent")


@router.put("/me/availability", response_model=StubResponse)
async def set_availability() -> StubResponse:
    return StubResponse(endpoint="PUT /me/availability")


@router.get("/me/appointments", response_model=StubResponse)
async def list_my_appointments() -> StubResponse:
    return StubResponse(endpoint="GET /me/appointments")
