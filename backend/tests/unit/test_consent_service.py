"""Unit tests for patient consent capture (AC-016, AC-017) and its audit trail
(NFR-007)."""

from datetime import datetime, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from app.models import AuditLog, PatientConsent, User
from app.security import hash_password
from app.services import has_given_consent, record_consent, require_consent


def _make_user(db: DBSession, role: str = "patient", email: str = "patient@example.com") -> User:
    user = User(
        email=email,
        phone="+1 555 0100",
        password_hash=hash_password("pw1234567"),
        role=role,
        full_name="Pat Ient",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_ac016_require_consent_blocks_a_patient_without_consent(db_session: DBSession) -> None:
    patient = _make_user(db_session)

    with pytest.raises(HTTPException) as exc_info:
        require_consent(db_session, patient)

    assert exc_info.value.status_code == 403


def test_ac016_require_consent_allows_a_patient_after_consenting(db_session: DBSession) -> None:
    patient = _make_user(db_session)
    record_consent(db_session, patient)

    require_consent(db_session, patient)  # does not raise


def test_ac016_require_consent_does_not_apply_to_non_patient_roles(db_session: DBSession) -> None:
    doctor = _make_user(db_session, role="doctor", email="doctor@example.com")

    require_consent(db_session, doctor)  # does not raise: the gate is patient-specific


def test_ac017_record_consent_stores_consent_with_a_timestamp(db_session: DBSession) -> None:
    patient = _make_user(db_session)
    before = datetime.utcnow()

    consent = record_consent(db_session, patient)

    assert consent.consented is True
    assert consent.consented_at >= before - timedelta(seconds=5)

    reloaded = (
        db_session.query(PatientConsent).filter(PatientConsent.patient_id == patient.id).first()
    )
    assert reloaded is not None
    assert reloaded.consented is True
    assert reloaded.consented_at is not None


def test_ac017_record_consent_is_reported_through_has_given_consent(
    db_session: DBSession,
) -> None:
    patient = _make_user(db_session)

    assert has_given_consent(db_session, patient.id) is False

    record_consent(db_session, patient)

    assert has_given_consent(db_session, patient.id) is True


def test_ac017_recording_consent_again_refreshes_the_timestamp_without_duplicating(
    db_session: DBSession,
) -> None:
    patient = _make_user(db_session)
    first = record_consent(db_session, patient)
    second = record_consent(db_session, patient)

    assert first.id == second.id
    assert second.consented_at >= first.consented_at

    rows = db_session.query(PatientConsent).filter(PatientConsent.patient_id == patient.id).all()
    assert len(rows) == 1


def test_ac017_recording_consent_creates_an_audit_entry(db_session: DBSession) -> None:
    patient = _make_user(db_session)

    consent = record_consent(db_session, patient)

    entries = db_session.query(AuditLog).filter(AuditLog.user_id == patient.id).all()
    assert len(entries) == 1
    entry = entries[0]
    assert entry.action == "create"
    assert entry.entity_type == "patient_consent"
    assert entry.entity_id == consent.id
    assert entry.created_at is not None
