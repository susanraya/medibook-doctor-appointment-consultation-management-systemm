"""The backing services this application is configured to reach.

Each entry maps a service to the environment variable that addresses it. The value
comes from docker-compose.yml through .env.example, so the health check reports
what the running deployment can actually reach.
"""

import os

from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from app.errors import EMAIL_ALREADY_IN_USE
from app.models import User

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
