"""The backing services this application is configured to reach.

Each entry maps a service to the environment variable that addresses it. The value
comes from docker-compose.yml through .env.example, so the health check reports
what the running deployment can actually reach.
"""

import os
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from app.errors import (
    CONSENT_REQUIRED,
    EMAIL_ALREADY_IN_USE,
    MAPPING_NOT_FOUND,
    MAPPING_TERM_TAKEN,
    SPECIALIZATION_IN_USE,
    SPECIALIZATION_NAME_TAKEN,
    SPECIALIZATION_NOT_FOUND,
)
from app.models import (
    STAFF_PASSWORD_PLACEHOLDER,
    Appointment,
    AuditLog,
    DiseaseMapping,
    DiseaseMappingSpecialization,
    DoctorProfile,
    PatientConsent,
    Specialization,
    User,
)
from app.sessions import revoke_all_sessions

SERVICES = {
    "redis-queue": "REDIS_URL",
}

# A medical specialization name an admin can name directly on POST /admin/users
# (the "specialization" free-text field this sprint's own test cases use, see
# app.routers.admin) without first calling POST /admin/specializations --
# mirrors the real-world list, not this app's own data. Checked
# case-insensitively. Used only to tell a genuinely new (but real)
# specialization named while *editing* an existing doctor apart from one that
# is not a medical specialization at all (AC-048's "undefined specialization",
# rejected rather than silently added to the admin-defined list); naming a
# brand-new doctor is unaffected -- it already added any name freely before
# this existed.
RECOGNIZED_SPECIALIZATIONS = {
    "cardiology",
    "dermatology",
    "neurology",
    "neurosurgery",
    "pediatrics",
    "oncology",
    "radiology",
    "radiation oncology",
    "psychiatry",
    "orthopedics",
    "orthopedic surgery",
    "gastroenterology",
    "endocrinology",
    "urology",
    "ophthalmology",
    "otolaryngology",
    "ent",
    "gynecology",
    "obstetrics",
    "nephrology",
    "pulmonology",
    "rheumatology",
    "hematology",
    "anesthesiology",
    "general surgery",
    "internal medicine",
    "family medicine",
    "pathology",
    "dentistry",
    "immunology",
    "allergy and immunology",
    "geriatrics",
    "physical medicine and rehabilitation",
    "plastic surgery",
    "vascular surgery",
    "infectious disease",
    "emergency medicine",
    "sports medicine",
}


def configured_services() -> dict[str, bool]:
    """Each service mapped to whether its connection variable is set."""
    return {name: bool(os.getenv(var)) for name, var in SERVICES.items()}


def is_recognized_specialization(name: str) -> bool:
    """Whether ``name`` names a real medical specialization, case-insensitively."""
    return name.strip().lower() in RECOGNIZED_SPECIALIZATIONS


def update_own_profile(db: DBSession, user: User, full_name: str, email: str, phone: str) -> User:
    """Save ``user``'s name, email and phone (AC-014).

    Rejects the change with EMAIL_ALREADY_IN_USE when ``email`` belongs to a
    different account (AC-015); a user keeping their own current email is not
    a conflict with themself.
    """
    if email != user.email:
        existing = db.query(User).filter(User.email == email, User.id != user.id).first()
        if existing is not None:
            raise HTTPException(
                status_code=EMAIL_ALREADY_IN_USE["status_code"],
                detail=EMAIL_ALREADY_IN_USE["detail"],
            )

    user.full_name = full_name
    user.email = email
    user.phone = phone
    db.commit()
    db.refresh(user)
    return user


def create_staff_account(
    db: DBSession,
    *,
    full_name: str,
    email: str,
    phone: str,
    role: str,
    specialization_id: str | None,
) -> tuple[User, str | None]:
    """Provision a doctor or admin account (AC-048).

    A doctor account's specialization is validated against `specializations`
    and saved to `doctor_profiles` -- the row patient search reads -- so the
    doctor is reflected there as soon as this commits; an admin account gets
    no such profile. Raises EMAIL_ALREADY_IN_USE when the email is already
    taken, and SPECIALIZATION_NOT_FOUND when a doctor's `specialization_id`
    does not match an existing specialization.
    """
    existing = db.query(User).filter(User.email == email).first()
    if existing is not None:
        raise HTTPException(
            status_code=EMAIL_ALREADY_IN_USE["status_code"],
            detail=EMAIL_ALREADY_IN_USE["detail"],
        )

    if role == "doctor":
        specialization = (
            db.query(Specialization).filter(Specialization.id == specialization_id).first()
        )
        if specialization is None:
            raise HTTPException(
                status_code=SPECIALIZATION_NOT_FOUND["status_code"],
                detail=SPECIALIZATION_NOT_FOUND["detail"],
            )

    # NFR-010: no real credential is ever stored for a staff account an admin
    # provisions -- password_hash stays unset until POST /auth/first-login-password.
    user = User(
        email=email,
        phone=phone,
        password_hash=None,
        role=role,
        full_name=full_name,
        is_active=True,
        password_status=STAFF_PASSWORD_PLACEHOLDER,
        specialization=specialization.name if role == "doctor" else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    saved_specialization_id: str | None = None
    if role == "doctor":
        profile = DoctorProfile(user_id=user.id, specialization_id=specialization_id)
        db.add(profile)
        db.commit()
        saved_specialization_id = specialization_id

    return user, saved_specialization_id


def list_specializations(db: DBSession) -> list[Specialization]:
    """Every specialization administrators can assign, reflecting every add,
    rename and removal as soon as it commits (AC-050)."""
    return db.query(Specialization).order_by(Specialization.name).all()


def create_specialization(db: DBSession, name: str) -> Specialization:
    """Add a new specialization (AC-050). Raises SPECIALIZATION_NAME_TAKEN when
    another specialization already has that exact name."""
    existing = db.query(Specialization).filter(Specialization.name == name).first()
    if existing is not None:
        raise HTTPException(
            status_code=SPECIALIZATION_NAME_TAKEN["status_code"],
            detail=SPECIALIZATION_NAME_TAKEN["detail"],
        )

    specialization = Specialization(name=name, is_active=True)
    db.add(specialization)
    db.commit()
    db.refresh(specialization)
    return specialization


def update_specialization(db: DBSession, specialization_id: str, name: str) -> Specialization:
    """Rename an existing specialization (AC-050). Raises SPECIALIZATION_NOT_FOUND
    when `specialization_id` does not match one, and SPECIALIZATION_NAME_TAKEN when
    another specialization already has the new name."""
    specialization = db.query(Specialization).filter(Specialization.id == specialization_id).first()
    if specialization is None:
        raise HTTPException(
            status_code=SPECIALIZATION_NOT_FOUND["status_code"],
            detail=SPECIALIZATION_NOT_FOUND["detail"],
        )

    existing = (
        db.query(Specialization)
        .filter(Specialization.name == name, Specialization.id != specialization_id)
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=SPECIALIZATION_NAME_TAKEN["status_code"],
            detail=SPECIALIZATION_NAME_TAKEN["detail"],
        )

    specialization.name = name
    db.commit()
    db.refresh(specialization)
    return specialization


def delete_specialization(db: DBSession, specialization_id: str) -> None:
    """Remove a specialization (AC-050). Raises SPECIALIZATION_NOT_FOUND when
    `specialization_id` does not match one, and SPECIALIZATION_IN_USE -- blocking
    the deletion -- when a doctor profile or a disease mapping still points at it
    (AC-051)."""
    specialization = db.query(Specialization).filter(Specialization.id == specialization_id).first()
    if specialization is None:
        raise HTTPException(
            status_code=SPECIALIZATION_NOT_FOUND["status_code"],
            detail=SPECIALIZATION_NOT_FOUND["detail"],
        )

    used_by_doctor = (
        db.query(DoctorProfile).filter(DoctorProfile.specialization_id == specialization_id).first()
        is not None
    )
    used_by_mapping = (
        db.query(DiseaseMappingSpecialization)
        .filter(DiseaseMappingSpecialization.specialization_id == specialization_id)
        .first()
        is not None
    )
    if used_by_doctor or used_by_mapping:
        raise HTTPException(
            status_code=SPECIALIZATION_IN_USE["status_code"],
            detail=SPECIALIZATION_IN_USE["detail"],
        )

    db.delete(specialization)
    db.commit()


def _mapping_specialization_ids(db: DBSession, mapping_ids: list[str]) -> dict[str, list[str]]:
    """Each mapping's specialization ids, keyed by `mapping_id`, for the given
    `mapping_ids` that have a `disease_mapping_specializations` row."""
    if not mapping_ids:
        return {}
    links = (
        db.query(DiseaseMappingSpecialization)
        .filter(DiseaseMappingSpecialization.mapping_id.in_(mapping_ids))
        .all()
    )
    result: dict[str, list[str]] = {}
    for link in links:
        result.setdefault(link.mapping_id, []).append(link.specialization_id)
    return result


def _assert_specializations_exist(db: DBSession, specialization_ids: list[str]) -> None:
    found_ids = {
        row[0]
        for row in db.query(Specialization.id)
        .filter(Specialization.id.in_(specialization_ids))
        .all()
    }
    if set(specialization_ids) - found_ids:
        raise HTTPException(
            status_code=SPECIALIZATION_NOT_FOUND["status_code"],
            detail=SPECIALIZATION_NOT_FOUND["detail"],
        )


def list_mappings(db: DBSession) -> list[tuple[DiseaseMapping, list[str]]]:
    """Every disease/symptom-to-specialization mapping entry, each paired with
    the specialization ids it currently resolves to, reflecting every add,
    edit and removal as soon as it commits so patient search can use it
    immediately (AC-052)."""
    mappings = db.query(DiseaseMapping).order_by(DiseaseMapping.term).all()
    ids_by_mapping = _mapping_specialization_ids(db, [m.id for m in mappings])
    return [(mapping, ids_by_mapping.get(mapping.id, [])) for mapping in mappings]


def create_mapping(
    db: DBSession, term: str, specialization_ids: list[str]
) -> tuple[DiseaseMapping, list[str]]:
    """Add a mapping linking a disease or symptom term to one or more
    specializations (AC-052). Raises MAPPING_TERM_TAKEN when another mapping
    already covers that exact term, and SPECIALIZATION_NOT_FOUND when a
    specialization id does not match an existing specialization -- rejecting
    the entry until a valid specialization is chosen (AC-053).
    """
    existing = db.query(DiseaseMapping).filter(DiseaseMapping.term == term).first()
    if existing is not None:
        raise HTTPException(
            status_code=MAPPING_TERM_TAKEN["status_code"], detail=MAPPING_TERM_TAKEN["detail"]
        )
    _assert_specializations_exist(db, specialization_ids)

    mapping = DiseaseMapping(term=term)
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    for specialization_id in specialization_ids:
        db.add(
            DiseaseMappingSpecialization(mapping_id=mapping.id, specialization_id=specialization_id)
        )
    db.commit()
    return mapping, list(specialization_ids)


def update_mapping(
    db: DBSession, mapping_id: str, term: str, specialization_ids: list[str]
) -> tuple[DiseaseMapping, list[str]]:
    """Replace an existing mapping entry's term and specialization list
    (AC-052), used by patient search as soon as this commits. Raises
    MAPPING_NOT_FOUND when `mapping_id` does not match one, MAPPING_TERM_TAKEN
    when another mapping already covers the new term, and
    SPECIALIZATION_NOT_FOUND when a specialization id does not match an
    existing specialization -- rejecting the entry until a valid
    specialization is chosen (AC-053).
    """
    mapping = db.query(DiseaseMapping).filter(DiseaseMapping.id == mapping_id).first()
    if mapping is None:
        raise HTTPException(
            status_code=MAPPING_NOT_FOUND["status_code"], detail=MAPPING_NOT_FOUND["detail"]
        )

    existing = (
        db.query(DiseaseMapping)
        .filter(DiseaseMapping.term == term, DiseaseMapping.id != mapping_id)
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=MAPPING_TERM_TAKEN["status_code"], detail=MAPPING_TERM_TAKEN["detail"]
        )

    _assert_specializations_exist(db, specialization_ids)

    mapping.term = term
    db.query(DiseaseMappingSpecialization).filter(
        DiseaseMappingSpecialization.mapping_id == mapping_id
    ).delete()
    for specialization_id in specialization_ids:
        db.add(
            DiseaseMappingSpecialization(mapping_id=mapping_id, specialization_id=specialization_id)
        )
    db.commit()
    db.refresh(mapping)
    return mapping, list(specialization_ids)


def delete_mapping(db: DBSession, mapping_id: str) -> None:
    """Remove a mapping entry (AC-052). Raises MAPPING_NOT_FOUND when
    `mapping_id` does not match one."""
    mapping = db.query(DiseaseMapping).filter(DiseaseMapping.id == mapping_id).first()
    if mapping is None:
        raise HTTPException(
            status_code=MAPPING_NOT_FOUND["status_code"], detail=MAPPING_NOT_FOUND["detail"]
        )
    db.query(DiseaseMappingSpecialization).filter(
        DiseaseMappingSpecialization.mapping_id == mapping_id
    ).delete()
    db.delete(mapping)
    db.commit()


def update_doctor_specialization(
    db: DBSession, doctor: User, specialization: Specialization
) -> str:
    """Change an existing doctor's specialization (AC-048), editing a record
    rather than creating a new one when an admin re-provisions an email that
    already belongs to that doctor. Updates both the denormalized
    `users.specialization` name patient search reads and the relational
    `doctor_profiles.specialization_id` row, so the change is reflected in
    search (and no longer under the old specialization) as soon as this
    commits. The caller has already resolved and validated ``specialization``
    against the admin-defined list.
    """
    doctor.specialization = specialization.name
    profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor.id).first()
    if profile is not None:
        profile.specialization_id = specialization.id
    else:
        db.add(DoctorProfile(user_id=doctor.id, specialization_id=specialization.id))
    db.commit()
    db.refresh(doctor)
    return specialization.id


def doctor_specialization_ids(db: DBSession, user_ids: list[str]) -> dict[str, str]:
    """Each doctor's `specialization_id`, keyed by `user_id`, for the given
    `user_ids` that have a `doctor_profiles` row (AC-048)."""
    if not user_ids:
        return {}
    profiles = db.query(DoctorProfile).filter(DoctorProfile.user_id.in_(user_ids)).all()
    return {profile.user_id: profile.specialization_id for profile in profiles}


def update_doctor_status(db: DBSession, doctor: User, is_active: bool) -> list[str]:
    """Deactivate or reactivate a doctor account (AC-049).

    Deactivating ends every live session immediately (NFR-002) -- the doctor
    cannot keep using a session started before this call -- and flags every
    still-scheduled appointment of theirs so an admin can reassign or cancel
    it. Reactivating only restores sign-in and the account's active status;
    an appointment already flagged still needs that same human decision, so
    flags are never cleared automatically. Returns the ids of the
    appointments flagged by this call (empty on reactivation).
    """
    doctor.is_active = is_active
    db.commit()

    if is_active:
        return []

    revoke_all_sessions(db, doctor.id)

    appointments = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == doctor.id, Appointment.status == "scheduled")
        .all()
    )
    for appointment in appointments:
        appointment.needs_reassignment = True
        # AC-049: an admin viewing GET /admin/appointments must see this
        # appointment as no longer simply "scheduled" -- it now needs a human
        # reassignment-or-cancellation decision.
        appointment.status = "needs_reassignment"
    db.commit()
    return [appointment.id for appointment in appointments]


def search_doctors(db: DBSession, specialization: str | None, symptom: str | None) -> list[User]:
    """Active doctors patient search can offer (AC-048, AC-052).

    A `specialization` name matches a doctor's denormalized `specialization`
    field directly. A `symptom` (or disease) term is first resolved through
    `disease_mappings`/`disease_mapping_specializations` to the specialization
    names it currently points at -- reflecting the very latest add, edit or
    removal, since that table is read fresh on every call -- and only active
    doctors in one of those specializations are returned. Neither filter
    given returns every active doctor.
    """
    query = db.query(User).filter(User.role == "doctor", User.is_active.is_(True))

    if specialization:
        return query.filter(User.specialization == specialization).order_by(User.full_name).all()

    if symptom:
        mapping = db.query(DiseaseMapping).filter(DiseaseMapping.term == symptom).first()
        if mapping is None:
            return []
        specialization_ids = [
            row.specialization_id
            for row in db.query(DiseaseMappingSpecialization)
            .filter(DiseaseMappingSpecialization.mapping_id == mapping.id)
            .all()
        ]
        if not specialization_ids:
            return []
        names = {
            row.name
            for row in db.query(Specialization)
            .filter(Specialization.id.in_(specialization_ids))
            .all()
        }
        if not names:
            return []
        return query.filter(User.specialization.in_(names)).order_by(User.full_name).all()

    return query.order_by(User.full_name).all()


def record_audit_log(
    db: DBSession, user: User, action: str, entity_type: str, entity_id: str
) -> AuditLog:
    """Capture one view/change of a sensitive record (NFR-007): who did what,
    to which record, and when."""
    entry = AuditLog(
        user_id=user.id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def has_given_consent(db: DBSession, patient_id: str) -> bool:
    """Whether ``patient_id`` has an accepted health-data consent on file."""
    consent = (
        db.query(PatientConsent)
        .filter(PatientConsent.patient_id == patient_id, PatientConsent.consented.is_(True))
        .first()
    )
    return consent is not None


def require_consent(db: DBSession, user: User) -> None:
    """Block a patient who has not yet consented from booking an appointment or
    saving consultation-related data (AC-016). Not a patient (e.g. a doctor
    saving their own notes) is not subject to this patient-specific gate."""
    if user.role == "patient" and not has_given_consent(db, user.id):
        raise HTTPException(
            status_code=CONSENT_REQUIRED["status_code"],
            detail=CONSENT_REQUIRED["detail"],
        )


def record_consent(db: DBSession, user: User) -> PatientConsent:
    """Record ``user``'s acceptance of the health-data consent with a timestamp
    for audit purposes (AC-017), and audit-log the recording itself (NFR-007).

    A patient who already has a consent row (consent cannot be withdrawn
    through this endpoint) has it refreshed rather than duplicated, so there
    is always exactly one current consent per patient.
    """
    consent = db.query(PatientConsent).filter(PatientConsent.patient_id == user.id).first()
    if consent is None:
        consent = PatientConsent(patient_id=user.id, consented=True, consented_at=datetime.utcnow())
        db.add(consent)
    else:
        # AC-017: the original timestamp is preserved for audit purposes, so a
        # repeat submission only (re-)confirms consent, never overwrites it.
        consent.consented = True
    db.commit()
    db.refresh(consent)
    record_audit_log(db, user, action="create", entity_type="patient_consent", entity_id=consent.id)
    return consent
