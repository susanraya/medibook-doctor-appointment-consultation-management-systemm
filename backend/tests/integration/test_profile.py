"""Integration tests for US-005: patient manages own profile (AC-014, AC-015)."""

import secrets

from fastapi.testclient import TestClient

PROFILE_URL = "/me/profile"
REGISTER_URL = "/auth/register"


def _register(client: TestClient, full_name: str, email: str, phone: str) -> str:
    """Register a new patient and return the session token it signs in with."""
    pw = secrets.token_urlsafe(16)
    response = client.post(
        REGISTER_URL,
        json={
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "password": pw,
        },
    )
    assert response.status_code == 201
    return response.json()["token"]


def test_tc001_update_own_profile_with_valid_name_email_and_phone(
    client: TestClient,
) -> None:
    token = _register(client, "Juan Diaz", "juan.old@example.com", "+1-555-0100")
    headers = {"Authorization": f"Bearer {token}"}

    update_response = client.put(
        PROFILE_URL,
        json={
            "full_name": "Maria Gonzalez",
            "email": "maria.gonzalez@example.com",
            "phone": "+1-555-0199",
        },
        headers=headers,
    )

    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["full_name"] == "Maria Gonzalez"
    assert updated["email"] == "maria.gonzalez@example.com"
    assert updated["phone"] == "+1-555-0199"

    get_response = client.get(PROFILE_URL, headers=headers)

    assert get_response.status_code == 200
    fetched = get_response.json()
    assert fetched["full_name"] == "Maria Gonzalez"
    assert fetched["email"] == "maria.gonzalez@example.com"
    assert fetched["phone"] == "+1-555-0199"


def test_tc003_reject_email_change_to_one_already_used_by_another_account(
    client: TestClient,
) -> None:
    _register(client, "Alice A", "alice@example.com", "+1-555-0200")
    token_b = _register(client, "Bob B", "bob@example.com", "+1-555-0300")
    headers = {"Authorization": f"Bearer {token_b}"}

    update_response = client.put(
        PROFILE_URL,
        json={
            "full_name": "Bob B",
            "email": "alice@example.com",
            "phone": "+1-555-0300",
        },
        headers=headers,
    )

    assert update_response.status_code == 409
    assert "already in use" in update_response.json()["detail"]

    get_response = client.get(PROFILE_URL, headers=headers)

    assert get_response.status_code == 200
    assert get_response.json()["email"] == "bob@example.com"
