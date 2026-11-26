"""Integration tests for US-003: admin-only staff provisioning (AC-008, AC-009,
AC-010), the status toggle, and first-login password setting."""

import secrets

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session as DBSession

from app.models import Session as SessionModel
from app.models import User
from app.security import hash_password
from app.sessions import create_session

PROVISION_URL = "/admin/users"
LIST_URL = "/admin/users"
FIRST_LOGIN_URL = "/auth/first-login-password"
LOGIN_URL = "/auth/login"


def _make_user(db: DBSession, role: str, email: str) -> User:
    user = User(
        email=email,
        phone="",
        password_hash=hash_password(secrets.token_urlsafe(12)),
        role=role,
        full_name="U",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _bearer(db: DBSession, role: str, email: str) -> dict:
    user = _make_user(db, role, email)
    token = create_session(db, user)
    return {"Authorization": f"Bearer {token}"}


def _admin_headers(db: DBSession) -> dict:
    return _bearer(db, "admin", "admin-provisioner@example.com")


def _provision_payload(role: str = "doctor", email: str = "new-doc@example.com") -> dict:
    return {
        "full_name": "New Doc",
        "email": email,
        "phone": "+1 555 0101",
        "role": role,
    }


def test_ac008_admin_creates_doctor_then_can_sign_in_after_first_login(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)

    create_response = client.post(
        PROVISION_URL, json=_provision_payload(role="doctor"), headers=headers
    )
    assert create_response.status_code == 201
    body = create_response.json()
    assert body["role"] == "doctor"
    assert body["password_status"] == "<set-at-first-login>"

    new_password = secrets.token_urlsafe(12)
    first_login_response = client.post(
        FIRST_LOGIN_URL, json={"email": "new-doc@example.com", "password": new_password}
    )
    assert first_login_response.status_code == 200
    assert first_login_response.json()["token"]

    login_response = client.post(
        LOGIN_URL, json={"email": "new-doc@example.com", "password": new_password}
    )
    assert login_response.status_code == 200
    assert login_response.json()["user"]["role"] == "doctor"


def test_ac008_admin_creates_admin_with_chosen_role(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)

    response = client.post(
        PROVISION_URL,
        json=_provision_payload(role="admin", email="new-admin@example.com"),
        headers=headers,
    )

    assert response.status_code == 201
    assert response.json()["role"] == "admin"


def test_ac009_provision_endpoint_rejects_patient_and_doctor_and_unauthenticated(
    client: TestClient, db_session: DBSession
) -> None:
    patient_headers = _bearer(db_session, "patient", "patient-x@example.com")
    doctor_headers = _bearer(db_session, "doctor", "doctor-x@example.com")

    patient_response = client.post(
        PROVISION_URL, json=_provision_payload(), headers=patient_headers
    )
    doctor_response = client.post(
        PROVISION_URL,
        json=_provision_payload(email="new-doc2@example.com"),
        headers=doctor_headers,
    )
    no_token_response = client.post(
        PROVISION_URL, json=_provision_payload(email="new-doc3@example.com")
    )

    assert patient_response.status_code == 403
    assert patient_response.json()["detail"] == "Forbidden"
    assert doctor_response.status_code == 403
    assert doctor_response.json()["detail"] == "Forbidden"
    assert no_token_response.status_code == 401


def test_ac009_list_and_status_endpoints_reject_non_admins(
    client: TestClient, db_session: DBSession
) -> None:
    patient_headers = _bearer(db_session, "patient", "patient-y@example.com")

    list_response = client.get(LIST_URL, headers=patient_headers)
    status_response = client.put(
        "/admin/users/some-id/status", json={"is_active": False}, headers=patient_headers
    )

    assert list_response.status_code == 403
    assert status_response.status_code == 403
    assert client.get(LIST_URL).status_code == 401
    assert client.put("/admin/users/some-id/status", json={"is_active": False}).status_code == 401


def test_ac010_provisioned_account_stores_no_real_credential(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)

    response = client.post(
        PROVISION_URL, json=_provision_payload(email="placeholder@example.com"), headers=headers
    )

    assert response.status_code == 201
    body = response.json()
    assert body["password_status"] == "<set-at-first-login>"
    assert "password" not in body
    assert "password_hash" not in body

    user = db_session.query(User).filter(User.email == "placeholder@example.com").first()
    assert user.password_hash is None
    assert user.password_status == "<set-at-first-login>"

    list_response = client.get(LIST_URL, headers=headers)
    assert list_response.status_code == 200
    listed_users = list_response.json()["users"]
    listed = next(u for u in listed_users if u["email"] == "placeholder@example.com")
    assert listed["password_status"] == "<set-at-first-login>"


def test_first_login_password_rejects_reuse_on_already_set_account(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    client.post(PROVISION_URL, json=_provision_payload(email="reuse@example.com"), headers=headers)

    first = client.post(
        FIRST_LOGIN_URL, json={"email": "reuse@example.com", "password": secrets.token_urlsafe(12)}
    )
    assert first.status_code == 200

    second = client.post(
        FIRST_LOGIN_URL, json={"email": "reuse@example.com", "password": secrets.token_urlsafe(12)}
    )
    assert second.status_code == 400
    assert second.json()["detail"] == "Password is already set"


def test_status_toggle_deactivates_and_revokes_tokens_then_reactivates(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    create_response = client.post(
        PROVISION_URL, json=_provision_payload(email="toggle@example.com"), headers=headers
    )
    user_id = create_response.json()["id"]

    password = secrets.token_urlsafe(12)
    login = client.post(FIRST_LOGIN_URL, json={"email": "toggle@example.com", "password": password})
    token = login.json()["token"]

    deactivate_response = client.put(
        f"/admin/users/{user_id}/status", json={"is_active": False}, headers=headers
    )
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["is_active"] is False

    session = db_session.query(SessionModel).filter(SessionModel.token == token).first()
    assert session.revoked_at is not None

    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 401

    reactivate_response = client.put(
        f"/admin/users/{user_id}/status", json={"is_active": True}, headers=headers
    )
    assert reactivate_response.status_code == 200
    assert reactivate_response.json()["is_active"] is True


def test_status_toggle_unknown_user_is_404(client: TestClient, db_session: DBSession) -> None:
    headers = _admin_headers(db_session)

    response = client.put(
        "/admin/users/does-not-exist/status", json={"is_active": False}, headers=headers
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_duplicate_staff_email_is_409(client: TestClient, db_session: DBSession) -> None:
    headers = _admin_headers(db_session)
    client.post(PROVISION_URL, json=_provision_payload(email="dupe@example.com"), headers=headers)

    response = client.post(
        PROVISION_URL, json=_provision_payload(email="dupe@example.com"), headers=headers
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "That email is already in use"


def test_provision_missing_or_invalid_fields_is_422_with_field_messages(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    payload = {"full_name": "", "email": "not-an-email", "phone": "", "role": "patient"}

    response = client.post(PROVISION_URL, json=payload, headers=headers)

    assert response.status_code == 422
    errors = response.json()["detail"]
    fields = {e["field"] for e in errors}
    assert "email" in fields
    assert "role" in fields
    assert all({"field", "message"} <= set(e) for e in errors)


def test_list_users_filters_by_role(client: TestClient, db_session: DBSession) -> None:
    headers = _admin_headers(db_session)
    client.post(
        PROVISION_URL,
        json=_provision_payload(role="doctor", email="doc-f@example.com"),
        headers=headers,
    )
    client.post(
        PROVISION_URL,
        json=_provision_payload(role="admin", email="admin-f@example.com"),
        headers=headers,
    )

    response = client.get(f"{LIST_URL}?role=doctor", headers=headers)

    assert response.status_code == 200
    emails = {u["email"] for u in response.json()["users"]}
    assert "doc-f@example.com" in emails
    assert "admin-f@example.com" not in emails
