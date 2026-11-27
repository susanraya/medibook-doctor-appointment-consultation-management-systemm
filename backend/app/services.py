"""The backing services this application is configured to reach.

Each entry maps a service to the environment variable that addresses it. The value
comes from docker-compose.yml through .env.example, so the health check reports
what the running deployment can actually reach.
"""

import os
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from app.errors import CONSENT_REQUIRED, EMAIL_ALREADY_IN_USE
from app.models import AuditLog, PatientConsent, User

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
