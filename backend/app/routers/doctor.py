"""The signed-in doctor's own dashboard.

Stubs only -- see `app.routers.auth` for why.
"""

from fastapi import APIRouter

from app.schemas import StubResponse

router = APIRouter(tags=["doctor"])


@router.get("/doctor/appointments", response_model=StubResponse)
async def doctor_appointments() -> StubResponse:
    return StubResponse(endpoint="GET /doctor/appointments")
