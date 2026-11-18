"""Startup seeding for the two accounts the deployment platform expects.

The platform always sets `BOOTSTRAP_ADMIN_EMAIL`/`BOOTSTRAP_ADMIN_PASSWORD` on
the deployed API, and (for end-to-end runs) `SMOKE_TEST_EMAIL`/
`SMOKE_TEST_PASSWORD`. Each seed runs once, idempotently -- only when no user
with that email already exists -- and never invents a name beyond the two
given. Locally and in tests, where none of these are set, nothing is seeded.

Called from `app.main`'s lifespan on every startup; exposed as plain
functions (not folded into the lifespan itself) so a test can call them
directly against a database of its own, with the environment variables it
needs set only for the duration of that test.
"""

import os

from sqlalchemy.orm import Session

from app.models import User
from app.security import hash_password


def _existing_user(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def seed_bootstrap_admin(db: Session) -> None:
    """The clinic's first admin account -- the highest role the app has."""
    email = os.getenv("BOOTSTRAP_ADMIN_EMAIL")
    password = os.getenv("BOOTSTRAP_ADMIN_PASSWORD")
    if not email or not password:
        return
    if _existing_user(db, email) is not None:
        return
    db.add(
        User(
            email=email,
            phone="",
            password_hash=hash_password(password),
            role="admin",
            full_name="Clinic Administrator",
            is_active=True,
        )
    )
    db.commit()


def seed_smoke_test_patient(db: Session) -> None:
    """One ordinary patient account -- the lowest role -- for end-to-end runs."""
    email = os.getenv("SMOKE_TEST_EMAIL")
    password = os.getenv("SMOKE_TEST_PASSWORD")
    if not email or not password:
        return
    if _existing_user(db, email) is not None:
        return
    db.add(
        User(
            email=email,
            phone="",
            password_hash=hash_password(password),
            role="patient",
            full_name="Smoke Test Patient",
            is_active=True,
        )
    )
    db.commit()


def seed_bootstrap_users(db: Session) -> None:
    """Both seeds, each a no-op unless its two environment variables are set."""
    seed_bootstrap_admin(db)
    seed_smoke_test_patient(db)
