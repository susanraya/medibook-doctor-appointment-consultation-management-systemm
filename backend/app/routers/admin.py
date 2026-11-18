"""Admin management: users, doctor availability overrides, appointment
oversight, specializations, disease mappings, doctor status, audit logs and
email provider configuration.

Stubs only -- see `app.routers.auth` for why.
"""

from fastapi import APIRouter, Depends

from app.deps import require_role
from app.schemas import StubResponse

router = APIRouter(prefix="/admin", tags=["admin"])

_require_admin = Depends(require_role("admin"))


@router.post("/users", response_model=StubResponse)
async def provision_user() -> StubResponse:
    return StubResponse(endpoint="POST /admin/users")


@router.put("/doctors/{doctor_id}/availability", response_model=StubResponse)
async def override_doctor_availability(doctor_id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /admin/doctors/{doctor_id}/availability")


@router.put("/doctors/{doctor_id}/status", response_model=StubResponse)
async def set_doctor_status(doctor_id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /admin/doctors/{doctor_id}/status")


@router.get("/appointments", response_model=StubResponse)
async def list_all_appointments() -> StubResponse:
    return StubResponse(endpoint="GET /admin/appointments")


@router.put("/appointments/{id}/reassign", response_model=StubResponse)
async def reassign_appointment(id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /admin/appointments/{id}/reassign")


@router.get("/specializations", response_model=StubResponse)
async def list_specializations() -> StubResponse:
    return StubResponse(endpoint="GET /admin/specializations")


@router.post("/specializations", response_model=StubResponse)
async def create_specialization() -> StubResponse:
    return StubResponse(endpoint="POST /admin/specializations")


@router.put("/specializations", response_model=StubResponse)
async def update_specialization() -> StubResponse:
    return StubResponse(endpoint="PUT /admin/specializations")


@router.delete("/specializations", response_model=StubResponse)
async def delete_specialization() -> StubResponse:
    return StubResponse(endpoint="DELETE /admin/specializations")


@router.get("/mappings", response_model=StubResponse)
async def list_mappings() -> StubResponse:
    return StubResponse(endpoint="GET /admin/mappings")


@router.post("/mappings", response_model=StubResponse)
async def create_mapping() -> StubResponse:
    return StubResponse(endpoint="POST /admin/mappings")


@router.put("/mappings", response_model=StubResponse)
async def update_mapping() -> StubResponse:
    return StubResponse(endpoint="PUT /admin/mappings")


@router.delete("/mappings", response_model=StubResponse)
async def delete_mapping() -> StubResponse:
    return StubResponse(endpoint="DELETE /admin/mappings")


@router.get("/audit-logs", response_model=StubResponse)
async def list_audit_logs(_user=_require_admin) -> StubResponse:
    return StubResponse(endpoint="GET /admin/audit-logs")


@router.put("/email-settings", response_model=StubResponse)
async def set_email_settings() -> StubResponse:
    return StubResponse(endpoint="PUT /admin/email-settings")
