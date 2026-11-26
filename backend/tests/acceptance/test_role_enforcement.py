"""US-002-3 acceptance: role boundaries enforced on the API (AC-011, AC-012, NFR-004).

A patient token must be rejected with 403 on a doctor-only and an admin-only
endpoint, and a doctor token must be rejected with 403 on an admin-only
endpoint. `/doctor/appointments` and `/admin/audit-logs` are the clearest
examples the approved API names for each boundary.

As of this run neither router applies a role guard yet (both answer 200 to
any caller, signed in or not) -- see the QA report for this as a defect
against AC-011/AC-012/NFR-004 rather than a bug in these tests.
"""

import secrets

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session as DBSession

from app.models import User
from app.security import hash_password
from app.sessions import create_session

DOCTOR_ONLY_ENDPOINT = "/doctor/appointments"
ADMIN_ONLY_ENDPOINT = "/admin/audit-logs"


def _make_user(db: DBSession, role: str) -> User:
    password = secrets.token_urlsafe(16)
    user = User(
        email=f"{role}-acceptance@example.com",
        phone="",
        password_hash=hash_password(password),
        role=role,
        full_name="U",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _bearer(db: DBSession, role: str) -> dict:
    user = _make_user(db, role)
    session_token = create_session(db, user)
    return {"Authorization": f"Bearer {session_token}"}


def test_ac011_patient_token_is_rejected_on_doctor_only_endpoint(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _bearer(db_session, "patient")

    response = client.get(DOCTOR_ONLY_ENDPOINT, headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Forbidden"


def test_ac011_patient_token_is_rejected_on_admin_only_endpoint(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _bearer(db_session, "patient")

    response = client.get(ADMIN_ONLY_ENDPOINT, headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Forbidden"


def test_ac012_doctor_token_is_rejected_on_admin_only_endpoint(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _bearer(db_session, "doctor")

    response = client.get(ADMIN_ONLY_ENDPOINT, headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Forbidden"
