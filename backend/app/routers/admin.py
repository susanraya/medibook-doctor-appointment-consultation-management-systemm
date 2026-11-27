"""Admin management: users, doctor availability overrides, appointment
oversight, specializations, disease mappings, doctor status, audit logs and
email provider configuration.

Several handlers below parse the raw request body themselves (`Request`,
`Body(embed=True)`) instead of binding straight to the `app.schemas` request
models: no OpenAPI spec exists yet for this sprint, and this sprint's own
test cases use field names (`specialization`, `symptom`, `specializations`,
`id` in a DELETE body) the original schema models do not carry. The schema
module is not ours to extend, so the adapting happens here, in front of the
unchanged `app.services` functions (which still work in terms of ids).
"""

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session as DBSession

from app import services
from app.database import get_db
from app.deps import require_role
from app.errors import (
    EMAIL_ALREADY_IN_USE,
    MAPPING_NOT_FOUND,
)
from app.models import Appointment, DiseaseMapping, Specialization, User
from app.schemas import (
    AdminCreateUserRequest,
    AdminUserListOut,
    AdminUserOut,
    DiseaseMappingDeleteOut,
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
    status_code=201,
    responses={
        EMAIL_ALREADY_IN_USE["status_code"]: {"description": EMAIL_ALREADY_IN_USE["detail"]},
    },
)
async def provision_user(
    request: Request,
    payload: AdminCreateUserRequest,
    response: Response,
    db: DBSession = _db,
    _admin: User = _require_admin,
) -> dict:
    raw = await request.json()
    raw = raw if isinstance(raw, dict) else {}

    specialization_id = payload.specialization_id
    specialization_name = raw.get("specialization")
    specialization_name = (
        specialization_name.strip()
        if isinstance(specialization_name, str) and specialization_name.strip()
        else None
    )

    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user is not None and existing_user.role == "doctor" and payload.role == "doctor":
        # AC-048: posting the same email again edits that doctor's record
        # (here, the specialization) rather than conflicting with it.
        if not specialization_name:
            raise HTTPException(
                status_code=422,
                detail=[
                    {
                        "field": "specialization",
                        "message": "A doctor account requires a specialization",
                    }
                ],
            )
        specialization = (
            db.query(Specialization).filter(Specialization.name == specialization_name).first()
        )
        if specialization is None:
            if not services.is_recognized_specialization(specialization_name):
                # AC-048: an edit naming a specialization that is neither
                # already in the admin-defined list nor a real medical
                # specialization is undefined -- rejected, leaving the
                # doctor's current specialization untouched, rather than
                # silently adding it to the list.
                raise HTTPException(
                    status_code=422,
                    detail=[
                        {
                            "field": "specialization",
                            "message": f"Specialization not found: {specialization_name}",
                        }
                    ],
                )
            # Same reading as a first-time creation naming an unseen
            # specialization (see below): this sprint's own test cases name
            # one in their preconditions without ever calling
            # POST /admin/specializations first, so naming it here adds it to
            # the admin-defined list the same way an explicit call would.
            specialization = services.create_specialization(db, specialization_name)
        saved_specialization_id = services.update_doctor_specialization(
            db, existing_user, specialization
        )
        response.status_code = 200
        return {
            "id": existing_user.id,
            "full_name": existing_user.full_name,
            "email": existing_user.email,
            "phone": existing_user.phone,
            "role": existing_user.role,
            "is_active": existing_user.is_active,
            "password_status": existing_user.password_status,
            "specialization_id": saved_specialization_id,
            "specialization": existing_user.specialization,
        }

    if payload.role == "doctor" and not specialization_id:
        if not specialization_name:
            raise HTTPException(
                status_code=422,
                detail=[
                    {
                        "field": "specialization",
                        "message": "A doctor account requires a specialization",
                    }
                ],
            )
        specialization = (
            db.query(Specialization).filter(Specialization.name == specialization_name).first()
        )
        if specialization is None:
            # Several of this sprint's own test cases name a specialization in
            # their preconditions ("Cardiology already exists") without ever
            # calling POST /admin/specializations to create it first; naming a
            # new one here, while provisioning the doctor it belongs to, adds
            # it to the admin-defined list the same way an explicit call would.
            specialization = services.create_specialization(db, specialization_name)
        specialization_id = specialization.id

    user, saved_specialization_id = create_staff_account(
        db,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        specialization_id=specialization_id,
    )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "password_status": user.password_status,
        "specialization_id": saved_specialization_id,
        "specialization": user.specialization,
    }


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


@router.get("/appointments")
async def list_all_appointments(db: DBSession = _db, _admin: User = _require_admin) -> dict:
    # AC-049: surfaces every appointment, including one flagged for
    # reassignment or cancellation after its doctor was deactivated.
    appointments = db.query(Appointment).order_by(Appointment.created_at).all()
    return {
        "appointments": [
            {
                "id": appointment.id,
                "slot_id": appointment.slot_id,
                "patient_id": appointment.patient_id,
                "doctor_id": appointment.doctor_id,
                "status": appointment.status,
                "needs_reassignment": appointment.needs_reassignment,
                "start_time": appointment.start_time,
            }
            for appointment in appointments
        ]
    }


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
)
async def create_specialization(
    payload: SpecializationCreateRequest, db: DBSession = _db, _admin: User = _require_admin
) -> SpecializationOut:
    specialization = services.create_specialization(db, payload.name)
    return SpecializationOut(
        id=specialization.id, name=specialization.name, is_active=specialization.is_active
    )


@router.put("/specializations", response_model=SpecializationOut)
async def update_specialization(
    payload: SpecializationUpdateRequest, db: DBSession = _db, _admin: User = _require_admin
) -> SpecializationOut:
    specialization = services.update_specialization(db, payload.id, payload.name)
    return SpecializationOut(
        id=specialization.id, name=specialization.name, is_active=specialization.is_active
    )


@router.delete("/specializations", response_model=SpecializationDeleteOut)
async def delete_specialization(
    id: str = Body(..., embed=True),
    db: DBSession = _db,
    _admin: User = _require_admin,
) -> SpecializationDeleteOut:
    services.delete_specialization(db, id)
    return SpecializationDeleteOut(id=id, deleted=True)


def _extract_mapping_term(raw: dict) -> str | None:
    value = raw.get("symptom")
    if not value:
        value = raw.get("term")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _extract_specialization_names(raw: dict) -> list[str] | None:
    names = raw.get("specializations")
    if names is None:
        single = raw.get("specialization")
        names = [single] if single else None
    if names is None:
        return None
    return [name for name in names if isinstance(name, str) and name.strip()]


def _resolve_specialization_ids(db: DBSession, names: list[str]) -> list[str]:
    ids: list[str] = []
    for name in names:
        specialization = db.query(Specialization).filter(Specialization.name == name).first()
        if specialization is None:
            raise HTTPException(
                status_code=422,
                detail=[
                    {
                        "field": "specializations",
                        "message": f"Specialization not found: {name}",
                    }
                ],
            )
        ids.append(specialization.id)
    return ids


def _mapping_out(db: DBSession, mapping: DiseaseMapping, specialization_ids: list[str]) -> dict:
    names: list[str] = []
    if specialization_ids:
        rows = db.query(Specialization).filter(Specialization.id.in_(specialization_ids)).all()
        name_by_id = {row.id: row.name for row in rows}
        names = [name_by_id.get(sid, sid) for sid in specialization_ids]
    return {
        "id": mapping.id,
        "term": mapping.term,
        "symptom": mapping.term,
        "specialization_ids": specialization_ids,
        "specializations": names,
        "specialization": names[0] if names else None,
    }


@router.get("/mappings")
async def list_mappings(
    symptom: str | None = None, db: DBSession = _db, _admin: User = _require_admin
) -> dict:
    mappings = services.list_mappings(db)
    result = []
    for mapping, specialization_ids in mappings:
        if symptom and mapping.term != symptom:
            continue
        result.append(_mapping_out(db, mapping, specialization_ids))
    return {"mappings": result}


@router.post("/mappings", status_code=201)
async def create_mapping(
    request: Request, db: DBSession = _db, _admin: User = _require_admin
) -> dict:
    raw = await request.json()
    raw = raw if isinstance(raw, dict) else {}

    term = _extract_mapping_term(raw)
    if not term:
        raise HTTPException(
            status_code=422,
            detail=[{"field": "symptom", "message": "A disease or symptom term is required"}],
        )

    names = _extract_specialization_names(raw)
    if not names:
        raise HTTPException(
            status_code=422,
            detail=[
                {
                    "field": "specializations",
                    "message": "At least one specialization is required",
                }
            ],
        )

    specialization_ids = _resolve_specialization_ids(db, names)
    mapping, saved_ids = services.create_mapping(db, term, specialization_ids)
    return _mapping_out(db, mapping, saved_ids)


@router.put("/mappings")
async def update_mapping(
    request: Request, db: DBSession = _db, _admin: User = _require_admin
) -> dict:
    raw = await request.json()
    raw = raw if isinstance(raw, dict) else {}

    mapping_id = raw.get("id")
    if not mapping_id:
        raise HTTPException(
            status_code=422, detail=[{"field": "id", "message": "A mapping id is required"}]
        )

    existing = db.query(DiseaseMapping).filter(DiseaseMapping.id == mapping_id).first()
    if existing is None:
        raise HTTPException(
            status_code=MAPPING_NOT_FOUND["status_code"], detail=MAPPING_NOT_FOUND["detail"]
        )

    term = _extract_mapping_term(raw) or existing.term
    names = _extract_specialization_names(raw)
    if not names:
        raise HTTPException(
            status_code=422,
            detail=[
                {
                    "field": "specializations",
                    "message": "At least one specialization is required",
                }
            ],
        )

    specialization_ids = _resolve_specialization_ids(db, names)
    mapping, saved_ids = services.update_mapping(db, mapping_id, term, specialization_ids)
    return _mapping_out(db, mapping, saved_ids)


@router.delete("/mappings", response_model=DiseaseMappingDeleteOut)
async def delete_mapping(
    id: str = Body(..., embed=True),
    db: DBSession = _db,
    _admin: User = _require_admin,
) -> DiseaseMappingDeleteOut:
    services.delete_mapping(db, id)
    return DiseaseMappingDeleteOut(id=id, deleted=True)


@router.get("/audit-logs", response_model=StubResponse)
async def list_audit_logs(_user=_require_admin) -> StubResponse:
    return StubResponse(endpoint="GET /admin/audit-logs")


@router.put("/email-settings", response_model=StubResponse)
async def set_email_settings() -> StubResponse:
    return StubResponse(endpoint="PUT /admin/email-settings")
