"""Admin management: users, doctor availability overrides, appointment
oversight, specializations, disease mappings, doctor status, audit logs and
email provider configuration.

Stubs only -- see `app.routers.auth` for why.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app import services
from app.database import get_db
from app.deps import require_role
from app.errors import (
    EMAIL_ALREADY_IN_USE,
    MAPPING_NOT_FOUND,
    MAPPING_TERM_TAKEN,
    SPECIALIZATION_IN_USE,
    SPECIALIZATION_NAME_TAKEN,
    SPECIALIZATION_NOT_FOUND,
)
from app.models import User
from app.schemas import (
    AdminCreateUserRequest,
    AdminUserListOut,
    AdminUserOut,
    DiseaseMappingCreateRequest,
    DiseaseMappingDeleteOut,
    DiseaseMappingListOut,
    DiseaseMappingOut,
    DiseaseMappingUpdateRequest,
    SpecializationCreateRequest,
    SpecializationDeleteOut,
    SpecializationListOut,
    SpecializationOut,
    SpecializationUpdateRequest,
    StubResponse,
    UserStatusOut,
    UserStatusUpdateRequest,
)
from app.services import create_staff_account, doctor_specialization_ids
from app.sessions import revoke_all_sessions

router = APIRouter(prefix="/admin", tags=["admin"])

_require_admin = Depends(require_role("admin"))
_db = Depends(get_db)


def _admin_user_out(user: User, specialization_id: str | None = None) -> AdminUserOut:
    return AdminUserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        password_status=user.password_status,
        specialization_id=specialization_id,
    )


@router.post(
    "/users",
    response_model=AdminUserOut,
    status_code=201,
    responses={
        EMAIL_ALREADY_IN_USE["status_code"]: {"description": EMAIL_ALREADY_IN_USE["detail"]},
        SPECIALIZATION_NOT_FOUND["status_code"]: {
            "description": SPECIALIZATION_NOT_FOUND["detail"]
        },
    },
)
async def provision_user(
    payload: AdminCreateUserRequest, db: DBSession = _db, _admin: User = _require_admin
) -> AdminUserOut:
    user, specialization_id = create_staff_account(
        db,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        specialization_id=payload.specialization_id,
    )
    return _admin_user_out(user, specialization_id=specialization_id)


@router.get("/users", response_model=AdminUserListOut)
async def list_users(
    role: str | None = None, db: DBSession = _db, _admin: User = _require_admin
) -> AdminUserListOut:
    query = db.query(User).filter(User.role.in_(["doctor", "admin"]))
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.created_at).all()
    specializations = doctor_specialization_ids(db, [u.id for u in users])
    return AdminUserListOut(
        users=[_admin_user_out(u, specialization_id=specializations.get(u.id)) for u in users]
    )


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


@router.get("/appointments", response_model=StubResponse)
async def list_all_appointments() -> StubResponse:
    return StubResponse(endpoint="GET /admin/appointments")


@router.put("/appointments/{id}/reassign", response_model=StubResponse)
async def reassign_appointment(id: str) -> StubResponse:
    return StubResponse(endpoint=f"PUT /admin/appointments/{id}/reassign")


@router.get("/specializations", response_model=SpecializationListOut)
async def list_specializations(
    db: DBSession = _db, _admin: User = _require_admin
) -> SpecializationListOut:
    specializations = services.list_specializations(db)
    return SpecializationListOut(
        specializations=[
            SpecializationOut(id=s.id, name=s.name, is_active=s.is_active) for s in specializations
        ]
    )


@router.post(
    "/specializations",
    response_model=SpecializationOut,
    status_code=201,
    responses={
        SPECIALIZATION_NAME_TAKEN["status_code"]: {
            "description": SPECIALIZATION_NAME_TAKEN["detail"]
        },
    },
)
async def create_specialization(
    payload: SpecializationCreateRequest, db: DBSession = _db, _admin: User = _require_admin
) -> SpecializationOut:
    specialization = services.create_specialization(db, payload.name)
    return SpecializationOut(
        id=specialization.id, name=specialization.name, is_active=specialization.is_active
    )


@router.put(
    "/specializations",
    response_model=SpecializationOut,
    responses={
        SPECIALIZATION_NOT_FOUND["status_code"]: {
            "description": SPECIALIZATION_NOT_FOUND["detail"]
        },
        SPECIALIZATION_NAME_TAKEN["status_code"]: {
            "description": SPECIALIZATION_NAME_TAKEN["detail"]
        },
    },
)
async def update_specialization(
    payload: SpecializationUpdateRequest, db: DBSession = _db, _admin: User = _require_admin
) -> SpecializationOut:
    specialization = services.update_specialization(db, payload.id, payload.name)
    return SpecializationOut(
        id=specialization.id, name=specialization.name, is_active=specialization.is_active
    )


@router.delete(
    "/specializations",
    response_model=SpecializationDeleteOut,
    responses={
        SPECIALIZATION_NOT_FOUND["status_code"]: {
            "description": SPECIALIZATION_NOT_FOUND["detail"]
        },
        SPECIALIZATION_IN_USE["status_code"]: {"description": SPECIALIZATION_IN_USE["detail"]},
    },
)
async def delete_specialization(
    id: str, db: DBSession = _db, _admin: User = _require_admin
) -> SpecializationDeleteOut:
    services.delete_specialization(db, id)
    return SpecializationDeleteOut(id=id, deleted=True)


@router.get("/mappings", response_model=DiseaseMappingListOut)
async def list_mappings(
    db: DBSession = _db, _admin: User = _require_admin
) -> DiseaseMappingListOut:
    mappings = services.list_mappings(db)
    return DiseaseMappingListOut(
        mappings=[
            DiseaseMappingOut(id=mapping.id, term=mapping.term, specialization_ids=ids)
            for mapping, ids in mappings
        ]
    )


@router.post(
    "/mappings",
    response_model=DiseaseMappingOut,
    status_code=201,
    responses={
        SPECIALIZATION_NOT_FOUND["status_code"]: {
            "description": SPECIALIZATION_NOT_FOUND["detail"]
        },
        MAPPING_TERM_TAKEN["status_code"]: {"description": MAPPING_TERM_TAKEN["detail"]},
    },
)
async def create_mapping(
    payload: DiseaseMappingCreateRequest, db: DBSession = _db, _admin: User = _require_admin
) -> DiseaseMappingOut:
    mapping, specialization_ids = services.create_mapping(
        db, payload.term, payload.specialization_ids
    )
    return DiseaseMappingOut(
        id=mapping.id, term=mapping.term, specialization_ids=specialization_ids
    )


@router.put(
    "/mappings",
    response_model=DiseaseMappingOut,
    responses={
        MAPPING_NOT_FOUND["status_code"]: {"description": MAPPING_NOT_FOUND["detail"]},
        SPECIALIZATION_NOT_FOUND["status_code"]: {
            "description": SPECIALIZATION_NOT_FOUND["detail"]
        },
        MAPPING_TERM_TAKEN["status_code"]: {"description": MAPPING_TERM_TAKEN["detail"]},
    },
)
async def update_mapping(
    payload: DiseaseMappingUpdateRequest, db: DBSession = _db, _admin: User = _require_admin
) -> DiseaseMappingOut:
    mapping, specialization_ids = services.update_mapping(
        db, payload.id, payload.term, payload.specialization_ids
    )
    return DiseaseMappingOut(
        id=mapping.id, term=mapping.term, specialization_ids=specialization_ids
    )


@router.delete(
    "/mappings",
    response_model=DiseaseMappingDeleteOut,
    responses={
        MAPPING_NOT_FOUND["status_code"]: {"description": MAPPING_NOT_FOUND["detail"]},
    },
)
async def delete_mapping(
    id: str, db: DBSession = _db, _admin: User = _require_admin
) -> DiseaseMappingDeleteOut:
    services.delete_mapping(db, id)
    return DiseaseMappingDeleteOut(id=id, deleted=True)


@router.get("/audit-logs", response_model=StubResponse)
async def list_audit_logs(_user=_require_admin) -> StubResponse:
    return StubResponse(endpoint="GET /admin/audit-logs")


@router.put("/email-settings", response_model=StubResponse)
async def set_email_settings() -> StubResponse:
    return StubResponse(endpoint="PUT /admin/email-settings")
