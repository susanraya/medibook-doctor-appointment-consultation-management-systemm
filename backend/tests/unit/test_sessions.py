"""Unit tests for session issue/revoke/revoke-all (AC-006, AC-007, AC-013)."""

from sqlalchemy.orm import Session as DBSession

from app.models import Session as SessionModel
from app.models import User
from app.security import hash_password
from app.sessions import create_session, revoke_all_sessions, revoke_session


def _make_user(db: DBSession, email: str = "u@example.com") -> User:
    user = User(
        email=email,
        phone="",
        password_hash=hash_password("pw1234567"),
        role="patient",
        full_name="U",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_create_session_issues_a_live_token(db_session: DBSession) -> None:
    user = _make_user(db_session)

    token = create_session(db_session, user)

    session = db_session.query(SessionModel).filter(SessionModel.token == token).first()
    assert session is not None
    assert session.user_id == user.id
    assert session.revoked_at is None


def test_ac006_revoke_session_marks_it_revoked_and_is_idempotent(db_session: DBSession) -> None:
    user = _make_user(db_session)
    token = create_session(db_session, user)

    assert revoke_session(db_session, token) is True
    assert revoke_session(db_session, token) is False  # already revoked

    session = db_session.query(SessionModel).filter(SessionModel.token == token).first()
    assert session.revoked_at is not None


def test_ac013_revoke_all_sessions_ends_every_live_token_for_the_user(
    db_session: DBSession,
) -> None:
    user = _make_user(db_session)
    token_a = create_session(db_session, user)
    token_b = create_session(db_session, user)

    revoke_all_sessions(db_session, user.id)

    for token in (token_a, token_b):
        session = db_session.query(SessionModel).filter(SessionModel.token == token).first()
        assert session.revoked_at is not None
