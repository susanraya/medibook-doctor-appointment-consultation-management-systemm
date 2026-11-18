"""Unit tests for the require_role/get_current_session guard
(AC-007, AC-011, AC-012, AC-013)."""

from datetime import datetime, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from app.deps import get_current_session, require_role
from app.models import Session as SessionModel
from app.models import User
from app.security import hash_password
from app.sessions import create_session


def _make_user(db: DBSession, role: str = "patient", is_active: bool = True) -> User:
    user = User(
        email=f"{role}-{is_active}@example.com",
        phone="",
        password_hash=hash_password("pw1234567"),
        role=role,
        full_name="U",
        is_active=is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_ac012_get_current_session_rejects_missing_token(db_session: DBSession) -> None:
    with pytest.raises(HTTPException) as exc:
        get_current_session(authorization=None, db=db_session)
    assert exc.value.status_code == 401


def test_get_current_session_rejects_unknown_token(db_session: DBSession) -> None:
    with pytest.raises(HTTPException) as exc:
        get_current_session(authorization="Bearer does-not-exist", db=db_session)
    assert exc.value.status_code == 401


def test_ac007_get_current_session_rejects_idle_token(db_session: DBSession, monkeypatch) -> None:
    monkeypatch.setenv("SESSION_IDLE_MINUTES", "30")
    user = _make_user(db_session)
    token = create_session(db_session, user)
    session = db_session.query(SessionModel).filter(SessionModel.token == token).first()
    session.last_activity_at = datetime.utcnow() - timedelta(minutes=31)
    db_session.commit()

    with pytest.raises(HTTPException) as exc:
        get_current_session(authorization=f"Bearer {token}", db=db_session)
    assert exc.value.status_code == 401


def test_ac013_get_current_session_rejects_deactivated_user(db_session: DBSession) -> None:
    user = _make_user(db_session, is_active=False)
    token = create_session(db_session, user)

    with pytest.raises(HTTPException) as exc:
        get_current_session(authorization=f"Bearer {token}", db=db_session)
    assert exc.value.status_code == 401


def test_get_current_session_refreshes_last_activity(db_session: DBSession) -> None:
    user = _make_user(db_session)
    token = create_session(db_session, user)
    session = db_session.query(SessionModel).filter(SessionModel.token == token).first()
    session.last_activity_at = datetime.utcnow() - timedelta(minutes=5)
    db_session.commit()
    old = session.last_activity_at

    get_current_session(authorization=f"Bearer {token}", db=db_session)

    db_session.refresh(session)
    assert session.last_activity_at > old


def test_ac011_require_role_allows_matching_role_and_rejects_others(db_session: DBSession) -> None:
    admin = _make_user(db_session, role="admin")
    patient = _make_user(db_session, role="patient")
    guard = require_role("admin")

    assert guard(user=admin) is admin
    with pytest.raises(HTTPException) as exc:
        guard(user=patient)
    assert exc.value.status_code == 403
    assert exc.value.detail == "Forbidden"
