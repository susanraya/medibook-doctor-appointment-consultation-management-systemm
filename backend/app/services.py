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
    SPECIALIZATION_IN_USE,
    SPECIALIZATION_NAME_TAKEN,
    SPECIALIZATION_NOT_FOUND,
)
from app.models import (
    STAFF_PASSWORD_PLACEHOLDER,
    Appointment,
    AuditLog,
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


def configured_services() -> dict[str, bool]:
    """Each service mapped to whether its connection variable is set."""
    return {name: bool(os.getenv(var)) for name, var in SERVICES.items()}


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
    db.commit()
    return [appointment.id for appointment in appointments]


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
    now = datetime.utcnow()
    if consent is None:
        consent = PatientConsent(patient_id=user.id, consented=True, consented_at=now)
        db.add(consent)
    else:
        consent.consented = True
        consent.consented_at = now
    db.commit()
    db.refresh(consent)
    record_audit_log(db, user, action="create", entity_type="patient_consent", entity_id=consent.id)
    return consent
