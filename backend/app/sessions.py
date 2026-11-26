"""Server-side session lifecycle: issue, revoke, and revoke-all-on-deactivation.

Kept separate from `app.security` (which only hashes passwords and mints the
opaque token text itself) because every function here touches the database.
"""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session as DBSession

from app.models import Session as SessionModel
from app.models import User
from app.security import generate_session_token

# An absolute ceiling on a session's life, independent of the idle timeout
# (AC-007 normally ends it sooner if it sits unused). Generous on purpose.
_SESSION_MAX_AGE_DAYS = 30


def create_session(db: DBSession, user: User) -> str:
    """A new opaque token for ``user``, stored so later requests can verify it."""
    token = generate_session_token()
    now = datetime.utcnow()
    db.add(
        SessionModel(
            token=token,
            user_id=user.id,
            created_at=now,
            last_activity_at=now,
            expires_at=now + timedelta(days=_SESSION_MAX_AGE_DAYS),
        )
    )
    db.commit()
    return token


def revoke_session(db: DBSession, token: str) -> bool:
    """Revoke one token. Returns False if it did not exist or was already revoked."""
    session = db.query(SessionModel).filter(SessionModel.token == token).first()
    if session is None or session.revoked_at is not None:
        return False
    session.revoked_at = datetime.utcnow()
    db.commit()
    return True


def revoke_all_sessions(db: DBSession, user_id: str) -> None:
    """Every live token for ``user_id``. Call this the moment is_active becomes False (AC-013)."""
    now = datetime.utcnow()
    db.query(SessionModel).filter(
        SessionModel.user_id == user_id, SessionModel.revoked_at.is_(None)
    ).update({"revoked_at": now})
    db.commit()
