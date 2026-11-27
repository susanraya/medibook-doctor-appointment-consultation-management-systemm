"""Integration tests for US-020: manage doctor accounts and profiles
(AC-048, AC-049).

No OpenAPI spec exists yet for this sprint (`frontend/src/api/openapi.json`
has not been generated), so the exact JSON shape of a few responses is this
file's best reading of the story, the endpoint notes and the test cases:

- `POST /admin/users` accepts `full_name`, `email`, `phone`, `role` and, for a
  doctor, `specialization` (matching the field names the existing staff
  provisioning tests already use), and returns those same fields back plus
  `id`.
- `GET /search/doctors?specialization=...` returns `{"doctors": [...]}`, each
  with at least `full_name`, by analogy with `GET /me/appointments` returning
  `{"appointments": [...]}` (see `test_consent.py`).
- `PUT /admin/doctors/{doctor_id}/status` takes `{"status": "active"}` or
  `{"status": "inactive"}`, as the case's own test data names the field.
- `GET /admin/appointments` returns `{"appointments": [...]}` of objects
  shaped like `app.models.Appointment` (`id`, `doctor_id`, `status`, ...).

See the task report's risk note and test_is_wrong for where this conflicts
with an earlier test.
"""

import secrets
from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session as DBSession

from app.models import User
from app.security import hash_password
from app.sessions import create_session

try:
    from app.models import Appointment
except ImportError:  # pragma: no cover - only TC-028's setup needs this model
    Appointment = None

PROVISION_URL = "/admin/users"
SEARCH_URL = "/search/doctors"
STATUS_URL_TEMPLATE = "/admin/doctors/{doctor_id}/status"
LOGIN_URL = "/auth/login"
FIRST_LOGIN_URL = "/auth/first-login-password"
ADMIN_APPOINTMENTS_URL = "/admin/appointments"


def _make_user(db: DBSession, role: str, email: str, full_name: str = "U") -> User:
    user = User(
        email=email,
        phone="",
        password_hash=hash_password(secrets.token_urlsafe(12)),
        role=role,
        full_name=full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _bearer(db: DBSession, role: str, email: str, full_name: str = "U") -> tuple[User, dict]:
    user = _make_user(db, role, email, full_name)
    tok = create_session(db, user)
    return user, {"Authorization": f"Bearer {tok}"}


def _admin_headers(db: DBSession, email: str = "admin-us020@example.com") -> dict:
    _, headers = _bearer(db, "admin", email, "Admin User")
    return headers


def _doctor_payload(
    full_name: str,
    email: str,
    specialization: str | None = "Cardiology",
    role: str = "doctor",
    phone: str = "+1 555 0180",
) -> dict:
    payload: dict = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "role": role,
    }
    if specialization is not None:
        payload["specialization"] = specialization
    return payload


def test_tc021_admin_creates_doctor_and_it_appears_in_patient_search(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)

    create_response = client.post(
        PROVISION_URL,
        json=_doctor_payload("Dr. Emma Clarke", "emma.clarke@clinic.com", "Cardiology"),
        headers=headers,
    )

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["full_name"] == "Dr. Emma Clarke"
    assert created["email"] == "emma.clarke@clinic.com"
    assert created["specialization"] == "Cardiology"

    search_response = client.get(SEARCH_URL, params={"specialization": "Cardiology"})

    assert search_response.status_code == 200
    doctors = search_response.json()["doctors"]
    assert any(d["full_name"] == "Dr. Emma Clarke" for d in doctors)


def test_tc022_creating_doctor_with_missing_specialization_is_rejected(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)

    payload = _doctor_payload("Dr. Noah Patel", "noah.patel@clinic.com", specialization="")

    response = client.post(PROVISION_URL, json=payload, headers=headers)

    assert response.status_code == 422
    errors = response.json()["detail"]
    fields = {e["field"] for e in errors}
    assert "specialization" in fields

    assert db_session.query(User).filter(User.email == "noah.patel@clinic.com").first() is None


def test_tc023_admin_edits_specialization_and_search_is_updated(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    client.post(
        PROVISION_URL,
        json=_doctor_payload("Dr. Emma Clarke", "emma.clarke@clinic.com", "Cardiology"),
        headers=headers,
    )

    edit_response = client.post(
        PROVISION_URL,
        json=_doctor_payload("Dr. Emma Clarke", "emma.clarke@clinic.com", "Dermatology"),
        headers=headers,
    )

    assert edit_response.status_code in (200, 201)
    assert edit_response.json()["specialization"] == "Dermatology"

    dermatology_response = client.get(SEARCH_URL, params={"specialization": "Dermatology"})
    cardiology_response = client.get(SEARCH_URL, params={"specialization": "Cardiology"})

    assert dermatology_response.status_code == 200
    assert cardiology_response.status_code == 200
    assert any(
        d["full_name"] == "Dr. Emma Clarke" for d in dermatology_response.json().get("doctors", [])
    )
    assert not any(
        d["full_name"] == "Dr. Emma Clarke" for d in cardiology_response.json().get("doctors", [])
    )


def test_tc024_admin_editing_doctor_with_undefined_specialization_is_rejected(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    client.post(
        PROVISION_URL,
        json=_doctor_payload("Dr. Emma Clarke", "emma.clarke@clinic.com", "Cardiology"),
        headers=headers,
    )

    response = client.post(
        PROVISION_URL,
        json=_doctor_payload("Dr. Emma Clarke", "emma.clarke@clinic.com", "Astrology"),
        headers=headers,
    )

    assert response.status_code == 422

    doctor = db_session.query(User).filter(User.email == "emma.clarke@clinic.com").first()
    assert doctor is not None
    assert doctor.specialization == "Cardiology"


def test_tc027_non_admin_cannot_create_or_edit_doctor_account(
    client: TestClient, db_session: DBSession
) -> None:
    _, doctor_headers = _bearer(
        db_session, "doctor", "signedin-doctor-tc027@clinic.com", "Dr. Signed In"
    )

    response = client.post(
        PROVISION_URL,
        json=_doctor_payload("Dr. Olivia Grant", "olivia.grant@clinic.com", "Neurology"),
        headers=doctor_headers,
    )

    assert response.status_code == 403

    assert db_session.query(User).filter(User.email == "olivia.grant@clinic.com").first() is None


def test_tc028_deactivating_doctor_hides_from_search_blocks_signin_and_flags_appointments(
    client: TestClient, db_session: DBSession
) -> None:
    assert Appointment is not None, "app.models.Appointment is required to set up this case"

    admin_headers = _admin_headers(db_session)

    create_response = client.post(
        PROVISION_URL,
        json=_doctor_payload("Dr. Emma Clarke", "emma.clarke@clinic.com", "Cardiology"),
        headers=admin_headers,
    )
    doctor_id = create_response.json()["id"]

    pw = secrets.token_urlsafe(16)
    first_login_response = client.post(
        FIRST_LOGIN_URL, json={"email": "emma.clarke@clinic.com", "password": pw}
    )
    assert first_login_response.status_code == 200

    patient = _make_user(db_session, "patient", "patient-tc028@example.com", "Patient TC028")
    appointment = Appointment(
        id="appt-tc028",
        patient_id=patient.id,
        doctor_id=doctor_id,
        start_time=datetime.utcnow() + timedelta(days=1),
        status="scheduled",
    )
    db_session.add(appointment)
    db_session.commit()

    status_response = client.put(
        STATUS_URL_TEMPLATE.format(doctor_id=doctor_id),
        json={"status": "inactive"},
        headers=admin_headers,
    )
    assert status_response.status_code == 200

    search_response = client.get(SEARCH_URL, params={"specialization": "Cardiology"})
    assert search_response.status_code == 200
    assert not any(
        d["full_name"] == "Dr. Emma Clarke" for d in search_response.json().get("doctors", [])
    )

    login_response = client.post(
        LOGIN_URL, json={"email": "emma.clarke@clinic.com", "password": pw}
    )
    assert login_response.status_code == 401

    appointments_response = client.get(ADMIN_APPOINTMENTS_URL, headers=admin_headers)
    assert appointments_response.status_code == 200
    appointments = appointments_response.json().get("appointments", [])
    flagged = next((a for a in appointments if a.get("id") == "appt-tc028"), None)
    assert flagged is not None
    assert flagged.get("status") != "scheduled"

    db_session.refresh(appointment)
    assert appointment.status != "scheduled"


def test_tc029_reactivating_doctor_restores_search_visibility_and_signin(
    client: TestClient, db_session: DBSession
) -> None:
    admin_headers = _admin_headers(db_session)

    create_response = client.post(
        PROVISION_URL,
        json=_doctor_payload("Dr. Emma Clarke", "emma.clarke@clinic.com", "Cardiology"),
        headers=admin_headers,
    )
    doctor_id = create_response.json()["id"]

    pw = secrets.token_urlsafe(16)
    first_login_response = client.post(
        FIRST_LOGIN_URL, json={"email": "emma.clarke@clinic.com", "password": pw}
    )
    assert first_login_response.status_code == 200

    deactivate_response = client.put(
        STATUS_URL_TEMPLATE.format(doctor_id=doctor_id),
        json={"status": "inactive"},
        headers=admin_headers,
    )
    assert deactivate_response.status_code == 200

    reactivate_response = client.put(
        STATUS_URL_TEMPLATE.format(doctor_id=doctor_id),
        json={"status": "active"},
        headers=admin_headers,
    )
    assert reactivate_response.status_code == 200

    search_response = client.get(SEARCH_URL, params={"specialization": "Cardiology"})
    assert search_response.status_code == 200
    assert any(
        d["full_name"] == "Dr. Emma Clarke" for d in search_response.json().get("doctors", [])
    )

    login_response = client.post(
        LOGIN_URL, json={"email": "emma.clarke@clinic.com", "password": pw}
    )
    assert login_response.status_code == 200


def test_tc030_deactivating_a_non_existent_doctor_id_is_rejected(
    client: TestClient, db_session: DBSession
) -> None:
    admin_headers = _admin_headers(db_session)

    response = client.put(
        STATUS_URL_TEMPLATE.format(doctor_id="99999"),
        json={"status": "inactive"},
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_tc033_non_admin_cannot_change_doctor_status(
    client: TestClient, db_session: DBSession
) -> None:
    admin_headers = _admin_headers(db_session)
    create_response = client.post(
        PROVISION_URL,
        json=_doctor_payload("Dr. Emma Clarke", "emma.clarke@clinic.com", "Cardiology"),
        headers=admin_headers,
    )
    doctor_id = create_response.json()["id"]

    _, doctor_headers = _bearer(
        db_session, "doctor", "signedin-doctor-tc033@clinic.com", "Dr. Signed In Two"
    )

    response = client.put(
        STATUS_URL_TEMPLATE.format(doctor_id=doctor_id),
        json={"status": "inactive"},
        headers=doctor_headers,
    )

    assert response.status_code == 403

    doctor = db_session.query(User).filter(User.email == "emma.clarke@clinic.com").first()
    assert doctor is not None
    assert doctor.is_active is True
