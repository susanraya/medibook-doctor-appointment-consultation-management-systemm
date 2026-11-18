"""The reusable sign-in guard every protected endpoint depends on.

`get_current_session` is the single place that decides whether a bearer token still
means someone is signed in: it rejects a missing, unknown, revoked or idle-too-long
token, and an account that was deactivated, all with the same 401 so none of those
cases can be told apart from outside. A valid call refreshes `last_activity_at`,
which is what makes the idle timeout a *rolling* window (NFR-002, AC-007).

`require_role` builds on top of it for endpoints restricted to one or more roles
(AC-011/AC-012): still 401 for a bad session, 403 for a wrong role.

SESSION_IDLE_MINUTES is read from the environment directly, not through
`app.config.settings`, because that module caches its `Settings()` once at import
time -- a test that wants a short idle window has no way to change it after that.
"""

import os
from datetime import datetime, timedelta

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models import Session as SessionModel
from app.models import User


def _session_idle_minutes() -> int:
    return int(os.getenv("SESSION_IDLE_MINUTES", "30"))


def _unauthorized() -> HTTPException:
    return HTTPException(status_code=401, detail="Not authenticated")


_db_dep = Depends(get_db)
_auth_header = Header(default=None)


def get_current_session(
    authorization: str | None = _auth_header,
    db: DBSession = _db_dep,
) -> SessionModel:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise _unauthorized()
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise _unauthorized()

    session = db.query(SessionModel).filter(SessionModel.token == token).first()
    if session is None or session.revoked_at is not None:
        raise _unauthorized()

    now = datetime.utcnow()
    if now - session.last_activity_at > timedelta(minutes=_session_idle_minutes()):
        session.revoked_at = now
        db.commit()
        raise _unauthorized()

    user = db.query(User).filter(User.id == session.user_id).first()
    if user is None or not user.is_active:
        raise _unauthorized()

    session.last_activity_at = now
    db.commit()
    return session


_current_session_dep = Depends(get_current_session)


def get_current_user(
    session: SessionModel = _current_session_dep,
    db: DBSession = _db_dep,
) -> User:
    user = db.query(User).filter(User.id == session.user_id).first()
    if user is None:
        raise _unauthorized()
    return user


_current_user_dep = Depends(get_current_user)


def require_role(*roles: str):
    """A dependency that allows only the given roles; no roles means any signed-in user."""

    def _dep(user: User = _current_user_dep) -> User:
        if roles and user.role not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user

    return _dep
