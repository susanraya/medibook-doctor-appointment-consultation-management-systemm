"""Public-to-any-signed-in-user doctor availability.

Stubs only -- see `app.routers.auth` for why.
"""

from fastapi import APIRouter

from app.schemas import StubResponse

router = APIRouter(tags=["doctors"])


@router.get("/doctors/{doctor_id}/slots", response_model=StubResponse)
async def doctor_slots(doctor_id: str) -> StubResponse:
    return StubResponse(endpoint=f"GET /doctors/{doctor_id}/slots")
