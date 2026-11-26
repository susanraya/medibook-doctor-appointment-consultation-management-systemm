"""The platform's two startup seeds: bootstrap admin and smoke-test patient.

Each must be idempotent and a no-op unless its own pair of environment
variables is set -- exactly as `app.seed` promises. No password literal
appears here: `secrets.token_urlsafe` generates one at run time.
"""

import secrets

from sqlalchemy.orm import Session

from app.models import User
from app.seed import seed_bootstrap_admin, seed_bootstrap_users, seed_smoke_test_patient


def test_seed_bootstrap_users_does_nothing_without_env_vars(
    db_session: Session, monkeypatch
) -> None:
    monkeypatch.delenv("BOOTSTRAP_ADMIN_EMAIL", raising=False)
    monkeypatch.delenv("BOOTSTRAP_ADMIN_PASSWORD", raising=False)
    monkeypatch.delenv("SMOKE_TEST_EMAIL", raising=False)
    monkeypatch.delenv("SMOKE_TEST_PASSWORD", raising=False)

    seed_bootstrap_users(db_session)

    assert db_session.query(User).count() == 0


def test_seed_bootstrap_admin_creates_an_admin_once(db_session: Session, monkeypatch) -> None:
    email = "admin@example.test"
    password = secrets.token_urlsafe(16)
    monkeypatch.setenv("BOOTSTRAP_ADMIN_EMAIL", email)
    monkeypatch.setenv("BOOTSTRAP_ADMIN_PASSWORD", password)

    seed_bootstrap_admin(db_session)
    seed_bootstrap_admin(db_session)  # idempotent: a second run creates nothing new

    users = db_session.query(User).filter(User.email == email).all()
    assert len(users) == 1
    assert users[0].role == "admin"
    assert users[0].password_hash != password  # stored hashed, never in plain text


def test_seed_smoke_test_patient_creates_a_patient_once(db_session: Session, monkeypatch) -> None:
    email = "smoke@example.test"
    password = secrets.token_urlsafe(16)
    monkeypatch.setenv("SMOKE_TEST_EMAIL", email)
    monkeypatch.setenv("SMOKE_TEST_PASSWORD", password)

    seed_smoke_test_patient(db_session)
    seed_smoke_test_patient(db_session)

    users = db_session.query(User).filter(User.email == email).all()
    assert len(users) == 1
    assert users[0].role == "patient"
