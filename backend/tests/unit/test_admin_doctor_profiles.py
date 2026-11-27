"""Unit tests for admin doctor/admin account provisioning with a
specialization (AC-048)."""

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from app.models import DoctorProfile, Specialization, User
from app.services import create_staff_account, doctor_specialization_ids


def _make_specialization(db: DBSession, name: str = "Cardiology") -> Specialization:
    specialization = Specialization(name=name, is_active=True)
    db.add(specialization)
    db.commit()
    db.refresh(specialization)
    return specialization


def test_ac048_creates_doctor_account_and_saves_specialization_to_profile(
    db_session: DBSession,
) -> None:
    specialization = _make_specialization(db_session)

    user, specialization_id = create_staff_account(
        db_session,
        full_name="New Doc",
        email="new-doc@example.com",
        phone="+1 555 0101",
        role="doctor",
        specialization_id=specialization.id,
    )

    assert user.role == "doctor"
    assert user.password_hash is None
    assert specialization_id == specialization.id

    profile = db_session.query(DoctorProfile).filter(DoctorProfile.user_id == user.id).first()
    assert profile is not None
    assert profile.specialization_id == specialization.id


def test_ac048_creates_admin_account_with_no_doctor_profile(db_session: DBSession) -> None:
    user, specialization_id = create_staff_account(
        db_session,
        full_name="New Admin",
        email="new-admin@example.com",
        phone="+1 555 0102",
        role="admin",
        specialization_id=None,
    )

    assert user.role == "admin"
    assert specialization_id is None
    assert db_session.query(DoctorProfile).filter(DoctorProfile.user_id == user.id).first() is None


def test_ac048_rejects_an_unknown_specialization(db_session: DBSession) -> None:
    with pytest.raises(HTTPException) as exc_info:
        create_staff_account(
            db_session,
            full_name="New Doc",
            email="new-doc2@example.com",
            phone="+1 555 0103",
            role="doctor",
            specialization_id="does-not-exist",
        )

    assert exc_info.value.status_code == 404
    assert db_session.query(User).filter(User.email == "new-doc2@example.com").first() is None


def test_ac048_rejects_a_duplicate_email(db_session: DBSession) -> None:
    specialization = _make_specialization(db_session)
    create_staff_account(
        db_session,
        full_name="First Doc",
        email="dupe@example.com",
        phone="+1 555 0104",
        role="doctor",
        specialization_id=specialization.id,
    )

    with pytest.raises(HTTPException) as exc_info:
        create_staff_account(
            db_session,
            full_name="Second Doc",
            email="dupe@example.com",
            phone="+1 555 0105",
            role="doctor",
            specialization_id=specialization.id,
        )

    assert exc_info.value.status_code == 409


def test_ac048_doctor_specialization_ids_reflects_the_saved_profile(
    db_session: DBSession,
) -> None:
    specialization = _make_specialization(db_session, name="Dermatology")
    user, _ = create_staff_account(
        db_session,
        full_name="Derm Doc",
        email="derm-doc@example.com",
        phone="+1 555 0106",
        role="doctor",
        specialization_id=specialization.id,
    )

    mapping = doctor_specialization_ids(db_session, [user.id])

    assert mapping == {user.id: specialization.id}
