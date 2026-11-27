"""Integration tests for US-006: patient consent capture (AC-016, AC-017).

Field names for the consent response/profile (`consent_given`,
`consent_given_at`) and the booking/consultation refusal status (403 with a
`detail` mentioning consent) are this file's best reading of the story and
test cases: no OpenAPI spec exists yet for this sprint to confirm them
against. See the task report's risk note.
"""

import secrets
from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session as DBSession

from app.models import User
from app.security import hash_password
from app.sessions import create_session

try:
    from app.models import Appointment
except ImportError:  # pragma: no cover - only TC-009's setup needs this model
    Appointment = None

REGISTER_URL = "/auth/register"
CONSENT_URL = "/me/consent"
PROFILE_URL = "/me/profile"
APPOINTMENTS_URL = "/appointments"


def _register(client: TestClient, full_name: str, email: str) -> str:
    """Register a new patient and return the session token it signs in with."""
    pw = secrets.token_urlsafe(16)
    response = client.post(
        REGISTER_URL,
        json={
            "full_name": full_name,
            "email": email,
            "phone": "+1-555-0100",
            "password": pw,
        },
    )
    assert response.status_code == 201
    return response.json()["token"]


def _make_user(db: DBSession, role: str, email: str, full_name: str) -> User:
    user = User(
        email=email,
        phone="",
        password_hash=hash_password(secrets.token_urlsafe(16)),
        role=role,
        full_name=full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _bearer(db: DBSession, role: str, email: str, full_name: str) -> tuple[User, dict]:
    user = _make_user(db, role, email, full_name)
    token = create_session(db, user)
    return user, {"Authorization": f"Bearer {token}"}


def test_tc006_booking_is_rejected_when_consent_has_not_been_given(
    client: TestClient,
) -> None:
    token = _register(client, "Patient One", "patient1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(APPOINTMENTS_URL, json={"slot_id": "slot-456"}, headers=headers)

    assert response.status_code == 403
    assert "consent" in response.json().get("detail", "").lower()

    list_response = client.get("/me/appointments", headers=headers)
    if list_response.status_code == 200:
        appointments = list_response.json().get("appointments", [])
        assert not any(a.get("slot_id") == "slot-456" for a in appointments)


def test_tc007_booking_succeeds_once_consent_has_been_recorded(
    client: TestClient,
) -> None:
    token = _register(client, "Patient One", "patient1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    consent_response = client.post(CONSENT_URL, json={}, headers=headers)
    assert consent_response.status_code == 200
    assert consent_response.json().get("consent_given_at")

    booking_response = client.post(APPOINTMENTS_URL, json={"slot_id": "slot-456"}, headers=headers)

    assert booking_response.status_code == 201
    assert booking_response.json().get("slot_id") == "slot-456"


def test_tc009_saving_consultation_data_is_blocked_when_patient_has_not_consented(
    client: TestClient, db_session: DBSession
) -> None:
    assert Appointment is not None, "app.models.Appointment is required to set up this case"

    patient, _patient_headers = _bearer(
        db_session, "patient", "patient2@example.com", "Patient Two"
    )
    doctor, doctor_headers = _bearer(db_session, "doctor", "john.doe@example.com", "Dr. John Doe")

    appointment = Appointment(
        id="appt-789",
        patient_id=patient.id,
        doctor_id=doctor.id,
        start_time=datetime(2026, 12, 20, 14, 0),
        status="scheduled",
    )
    db_session.add(appointment)
    db_session.commit()

    response = client.put(
        f"{APPOINTMENTS_URL}/appt-789/consultation",
        json={"notes": "Patient reports mild headache", "diagnosis": "Tension headache"},
        headers=doctor_headers,
    )

    assert response.status_code == 403
    assert "consent" in response.json().get("detail", "").lower()

    db_session.refresh(appointment)
    assert appointment.notes is None
    assert appointment.diagnosis is None


def test_tc010_consent_is_stored_with_a_timestamp(client: TestClient) -> None:
    token = _register(client, "Patient One", "patient1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    consent_response = client.post(CONSENT_URL, json={}, headers=headers)

    assert consent_response.status_code == 200
    timestamp = consent_response.json().get("consent_given_at")
    assert timestamp

    profile_response = client.get(PROFILE_URL, headers=headers)

    assert profile_response.status_code == 200
    profile = profile_response.json()
    assert profile.get("consent_given") is True
    assert profile.get("consent_given_at") == timestamp


def test_tc011_giving_consent_again_does_not_change_the_original_timestamp(
    client: TestClient,
) -> None:
    token = _register(client, "Patient One", "patient1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    first_response = client.post(CONSENT_URL, json={}, headers=headers)
    assert first_response.status_code == 200
    original_timestamp = first_response.json().get("consent_given_at")
    assert original_timestamp

    profile_response = client.get(PROFILE_URL, headers=headers)
    assert profile_response.status_code == 200
    assert profile_response.json().get("consent_given_at") == original_timestamp

    second_response = client.post(CONSENT_URL, json={}, headers=headers)
    assert second_response.status_code == 200
    assert second_response.json().get("consent_given_at") == original_timestamp

    final_profile_response = client.get(PROFILE_URL, headers=headers)
    assert final_profile_response.status_code == 200
    assert final_profile_response.json().get("consent_given_at") == original_timestamp
