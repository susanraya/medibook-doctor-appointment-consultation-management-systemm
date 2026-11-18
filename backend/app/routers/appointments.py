"""Booking, rescheduling, cancelling and treating an appointment.

Stubs only -- see `app.routers.auth` for why. The real handlers are where
the architecture's double-booking prevention lives: lock the target slot
`FOR UPDATE` inside one transaction before booking it.
"""

from fastapi import APIRouter

from app.schemas import StubResponse

router = APIRouter(tags=["appointments"])


@router.post("/appointments", response_model=StubResponse, status_code=201)
async def book_appointment() -> StubResponse:
    return StubResponse(endpoint="POST /appointments")


@router.put("/appointments/{id}/reschedule", response_model=StubResponse)
async def reschedule_appointment(id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /appointments/{id}/reschedule")


@router.post("/appointments/{id}/cancel", response_model=StubResponse)
async def cancel_appointment(id: str) -> StubResponse:
    return StubResponse(endpoint=f"POST /appointments/{id}/cancel")


@router.get("/appointments/{id}/consultation", response_model=StubResponse)
async def get_consultation(id: str) -> StubResponse:
    return StubResponse(endpoint=f"GET /appointments/{id}/consultation")


@router.put("/appointments/{id}/consultation", response_model=StubResponse)
async def save_consultation(id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /appointments/{id}/consultation")


@router.put("/appointments/{id}/status", response_model=StubResponse)
async def update_appointment_status(id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /appointments/{id}/status")
