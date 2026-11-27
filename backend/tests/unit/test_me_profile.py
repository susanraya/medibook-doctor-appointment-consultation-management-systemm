"""Unit tests for own-profile view/update (AC-014, AC-015)."""

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from app.models import User
from app.security import hash_password
from app.services import update_own_profile


def _make_user(
    db: DBSession, email: str = "patient@example.com", full_name: str = "Pat Ient"
) -> User:
    user = User(
        email=email,
        phone="+1 555 0100",
        password_hash=hash_password("pw1234567"),
        role="patient",
        full_name=full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_ac014_updates_name_email_and_phone_with_valid_values(db_session: DBSession) -> None:
    user = _make_user(db_session)

    updated = update_own_profile(
        db_session,
        user,
        full_name="Patricia Ient",
        email="patricia@example.com",
        phone="+1 555 0199",
    )

    assert updated.full_name == "Patricia Ient"
    assert updated.email == "patricia@example.com"
    assert updated.phone == "+1 555 0199"

    reloaded = db_session.query(User).filter(User.id == user.id).first()
    assert reloaded is not None
    assert reloaded.full_name == "Patricia Ient"
    assert reloaded.email == "patricia@example.com"
    assert reloaded.phone == "+1 555 0199"


def test_ac014_keeping_the_same_email_is_not_a_conflict(db_session: DBSession) -> None:
    user = _make_user(db_session, email="same@example.com")

    updated = update_own_profile(
        db_session, user, full_name="New Name", email="same@example.com", phone="+1 555 0100"
    )

    assert updated.email == "same@example.com"
    assert updated.full_name == "New Name"


def test_ac015_rejects_an_email_already_used_by_another_account(db_session: DBSession) -> None:
    _make_user(db_session, email="taken@example.com", full_name="Other User")
    user = _make_user(db_session, email="me@example.com", full_name="Me")

    with pytest.raises(HTTPException) as exc_info:
        update_own_profile(
            db_session, user, full_name="Me", email="taken@example.com", phone="+1 555 0100"
        )

    assert exc_info.value.status_code == 409

    reloaded = db_session.query(User).filter(User.id == user.id).first()
    assert reloaded is not None
    assert reloaded.email == "me@example.com"
