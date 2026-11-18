"""The signed-in doctor's own dashboard.

Stubs only -- see `app.routers.auth` for why.
"""

from fastapi import APIRouter, Depends

from app.deps import require_role
from app.schemas import StubResponse

router = APIRouter(tags=["doctor"])

_require_doctor = Depends(require_role("doctor"))


@router.get("/doctor/appointments", response_model=StubResponse)
async def doctor_appointments(_user=_require_doctor) -> StubResponse:
    return StubResponse(endpoint="GET /doctor/appointments")
