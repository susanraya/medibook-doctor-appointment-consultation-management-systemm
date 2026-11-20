"""Admin management: users, doctor availability overrides, appointment
oversight, specializations, disease mappings, doctor status, audit logs and
email provider configuration.

Stubs only -- see `app.routers.auth` for why.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.deps import require_role
from app.models import STAFF_PASSWORD_PLACEHOLDER, User
from app.schemas import (
    AdminCreateUserRequest,
    AdminUserListOut,
    AdminUserOut,
    StubResponse,
    UserStatusOut,
    UserStatusUpdateRequest,
)
from app.sessions import revoke_all_sessions

router = APIRouter(prefix="/admin", tags=["admin"])

_require_admin = Depends(require_role("admin"))
_db = Depends(get_db)


def _admin_user_out(user: User) -> AdminUserOut:
    return AdminUserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        password_status=user.password_status,
    )


@router.post("/users", response_model=AdminUserOut, status_code=201)
async def provision_user(
    payload: AdminCreateUserRequest, db: DBSession = _db, _admin: User = _require_admin
) -> AdminUserOut:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing is not None:
        raise HTTPException(status_code=409, detail="That email is already in use")

    # NFR-010: no real credential is ever stored for a staff account an admin
    # provisions -- password_hash stays unset until POST /auth/first-login-password.
    user = User(
        email=payload.email,
        phone=payload.phone,
        password_hash=None,
        role=payload.role,
        full_name=payload.full_name,
        is_active=True,
        password_status=STAFF_PASSWORD_PLACEHOLDER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _admin_user_out(user)


@router.get("/users", response_model=AdminUserListOut)
async def list_users(
    role: str | None = None, db: DBSession = _db, _admin: User = _require_admin
) -> AdminUserListOut:
    query = db.query(User).filter(User.role.in_(["doctor", "admin"]))
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.created_at).all()
    return AdminUserListOut(users=[_admin_user_out(u) for u in users])


@router.put("/users/{user_id}/status", response_model=UserStatusOut)
async def set_user_status(
    user_id: str,
    payload: UserStatusUpdateRequest,
    db: DBSession = _db,
    _admin: User = _require_admin,
) -> UserStatusOut:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = payload.is_active
    db.commit()
    if not payload.is_active:
        # NFR-002: deactivation ends every live session immediately, not on next expiry.
        revoke_all_sessions(db, user.id)
    return UserStatusOut(id=user.id, is_active=user.is_active)


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
