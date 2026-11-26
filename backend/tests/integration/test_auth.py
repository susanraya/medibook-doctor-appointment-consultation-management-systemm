"""Integration tests for the auth core: register, login, logout, /auth/me,
idle expiry and role/deactivation enforcement (US-002-1)."""

from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session as DBSession

from app.models import Session as SessionModel
from app.models import User
from app.sessions import revoke_all_sessions

REGISTER_URL = "/auth/register"
LOGIN_URL = "/auth/login"


def _register_payload(email: str = "pat@example.com") -> dict:
    return {
        "full_name": "Pat Patient",
        "email": email,
        "phone": "+1 555 0100",
        "password": "correct-horse-1",
    }


def test_ac001_register_creates_patient_and_signs_in(
    client: TestClient, db_session: DBSession
) -> None:
    response = client.post(REGISTER_URL, json=_register_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["user"]["role"] == "patient"
    assert body["user"]["email"] == "pat@example.com"
    assert "token" in body and body["token"]

    user = db_session.query(User).filter(User.email == "pat@example.com").first()
    assert user is not None
    assert user.password_hash != "correct-horse-1"
    assert user.password_hash.startswith("$2b$")


def test_ac002_register_duplicate_email_is_rejected(
    client: TestClient, db_session: DBSession
) -> None:
    client.post(REGISTER_URL, json=_register_payload())

    response = client.post(REGISTER_URL, json=_register_payload())

    assert response.status_code == 409
    assert "already in use" in response.json()["detail"]
    assert db_session.query(User).filter(User.email == "pat@example.com").count() == 1


def test_ac003_register_rejects_invalid_or_missing_fields(
    client: TestClient, db_session: DBSession
) -> None:
    payload = _register_payload()
    payload["email"] = "not-an-email"
    payload.pop("phone")
    payload["password"] = "short"

    response = client.post(REGISTER_URL, json=payload)

    assert response.status_code == 422
    errors = response.json()["detail"]
    fields = {e["field"] for e in errors}
    assert "email" in fields
    assert "phone" in fields
    assert "password" in fields
    assert all({"field", "message"} <= set(e) for e in errors)
    assert db_session.query(User).count() == 0


def test_ac004_login_returns_token_and_role(client: TestClient) -> None:
    client.post(REGISTER_URL, json=_register_payload())

    response = client.post(
        LOGIN_URL, json={"email": "pat@example.com", "password": "correct-horse-1"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["role"] == "patient"
    assert body["token"]


def test_ac005_login_failure_message_is_generic_and_identical(client: TestClient) -> None:
    client.post(REGISTER_URL, json=_register_payload())

    unknown = client.post(LOGIN_URL, json={"email": "nobody@example.com", "password": "whatever1"})
    wrong_password = client.post(
        LOGIN_URL, json={"email": "pat@example.com", "password": "incorrect-pw"}
    )

    assert unknown.status_code == 401
    assert wrong_password.status_code == 401
    assert unknown.json()["detail"] == "Email or password is incorrect."
    assert wrong_password.json()["detail"] == unknown.json()["detail"]


def test_ac006_logout_revokes_token(client: TestClient) -> None:
    token = client.post(REGISTER_URL, json=_register_payload()).json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    logout_response = client.post("/auth/logout", headers=headers)
    me_response = client.get("/auth/me", headers=headers)

    assert logout_response.status_code == 204
    assert me_response.status_code == 401


def test_ac007_idle_session_expires_and_activity_refreshes(
    client: TestClient, db_session: DBSession, monkeypatch
) -> None:
    monkeypatch.setenv("SESSION_IDLE_MINUTES", "30")
    token = client.post(REGISTER_URL, json=_register_payload()).json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Still fresh: /auth/me succeeds and refreshes last_activity_at.
    assert client.get("/auth/me", headers=headers).status_code == 200

    session = db_session.query(SessionModel).filter(SessionModel.token == token).first()
    assert session.last_activity_at is not None

    # Idle for longer than the window: the next call is treated as expired.
    session.last_activity_at = datetime.utcnow() - timedelta(minutes=31)
    db_session.commit()

    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 401


def test_ac011_me_reports_role_from_the_server(client: TestClient) -> None:
    token = client.post(REGISTER_URL, json=_register_payload()).json()["token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["role"] == "patient"


def test_ac012_me_without_token_is_401(client: TestClient) -> None:
    assert client.get("/auth/me").status_code == 401


def test_ac013_deactivated_user_is_denied_and_all_tokens_revoked(
    client: TestClient, db_session: DBSession
) -> None:
    token = client.post(REGISTER_URL, json=_register_payload()).json()["token"]
    user = db_session.query(User).filter(User.email == "pat@example.com").first()

    user.is_active = False
    db_session.commit()
    revoke_all_sessions(db_session, user.id)

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
    session = db_session.query(SessionModel).filter(SessionModel.token == token).first()
    assert session.revoked_at is not None
