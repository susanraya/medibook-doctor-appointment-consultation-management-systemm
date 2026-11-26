"""Patient-facing search over the static disease/symptom-to-specialization
mapping and the specialization list.

Stubs only -- see `app.routers.auth` for why.
"""

from fastapi import APIRouter

from app.schemas import StubResponse

router = APIRouter(tags=["search"])


@router.get("/search/doctors", response_model=StubResponse)
async def search_doctors() -> StubResponse:
    return StubResponse(endpoint="GET /search/doctors")
