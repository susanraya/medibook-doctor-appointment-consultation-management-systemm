"""Integration tests for US-021: manage specializations (AC-050, AC-051).

No OpenAPI spec exists yet for this sprint (`frontend/src/api/openapi.json`
has not been generated), so the exact JSON shape of the specializations and
mappings endpoints is this file's best reading of the story, the one
endpoint note given ("GET/POST/PUT/DELETE /admin/specializations ... warns/
blocks on dependencies") and the test cases' own test data:

- `POST /admin/specializations` takes `{"name": ...}` and returns the created
  record (at least `id` and `name`), status 201.
- `GET /admin/specializations` returns `{"specializations": [...]}`, each
  item shaped like the created record, by analogy with `GET /admin/users`
  returning `{"users": [...]}` (see `test_admin_staff_provisioning.py`).
- `PUT /admin/specializations` and `DELETE /admin/specializations` take the
  target's `id` in the JSON body (not a path parameter), exactly as the test
  cases' own steps give them (`{ id: <id>, name: ... }` / `{ id: <id> }`).
  `DELETE` with a body is sent via `client.request("DELETE", ..., json=...)`
  because httpx's `delete()` helper does not accept a body.
- `POST/GET /admin/mappings` take/return `{"symptom": ..., "specialization":
  ...}` per mapping, with the list wrapped as `{"mappings": [...]}`.
- A doctor's specialization is the plain string field already used by
  `POST /admin/users` (see `test_doctor_management.py`), so "assigned to a
  doctor" is set up by creating a doctor with that specialization name.

For TC-040 and TC-041 the case allows either an outright block or a
confirmation step before the deletion is warned about ("blocked or requires
explicit confirmation"). Lacking a spec to pick between the two, these tests
assert the first-call response is not a silent success (status >= 400,
mentioning the dependency) and that the dependency is still present
afterwards -- the one invariant both readings share. See the task report's
risk note.
"""

import secrets

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session as DBSession

from app.models import User
from app.security import hash_password
from app.sessions import create_session

SPECIALIZATIONS_URL = "/admin/specializations"
MAPPINGS_URL = "/admin/mappings"
USERS_URL = "/admin/users"


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


def _admin_headers(db: DBSession, email: str = "admin-us021@example.com") -> dict:
    _, headers = _bearer(db, "admin", email, "Admin User")
    return headers


def _specialization_names(client: TestClient, headers: dict) -> set[str]:
    response = client.get(SPECIALIZATIONS_URL, headers=headers)
    assert response.status_code == 200
    return {s["name"] for s in response.json()["specializations"]}


def test_tc034_adding_a_specialization_reflects_it_in_the_list(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)

    create_response = client.post(SPECIALIZATIONS_URL, json={"name": "Cardiology"}, headers=headers)

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["name"] == "Cardiology"

    assert "Cardiology" in _specialization_names(client, headers)


def test_tc035_renaming_a_specialization_reflects_the_new_name_everywhere(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    create_response = client.post(SPECIALIZATIONS_URL, json={"name": "Cardiology"}, headers=headers)
    spec_id = create_response.json()["id"]

    rename_response = client.put(
        SPECIALIZATIONS_URL, json={"id": spec_id, "name": "Cardiac Care"}, headers=headers
    )

    assert rename_response.status_code == 200
    assert rename_response.json()["name"] == "Cardiac Care"

    names = _specialization_names(client, headers)
    assert "Cardiac Care" in names
    assert "Cardiology" not in names


def test_tc036_removing_a_specialization_with_no_dependencies_removes_it_everywhere(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    create_response = client.post(
        SPECIALIZATIONS_URL, json={"name": "Cardiac Care"}, headers=headers
    )
    spec_id = create_response.json()["id"]

    delete_response = client.request(
        "DELETE", SPECIALIZATIONS_URL, json={"id": spec_id}, headers=headers
    )

    assert delete_response.status_code in (200, 204)

    assert "Cardiac Care" not in _specialization_names(client, headers)


def test_tc037_a_new_specialization_can_be_selected_in_the_mapping_table(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)

    create_response = client.post(
        SPECIALIZATIONS_URL, json={"name": "Dermatology"}, headers=headers
    )
    assert create_response.status_code == 201

    mapping_response = client.post(
        MAPPINGS_URL,
        json={"symptom": "Rash", "specialization": "Dermatology"},
        headers=headers,
    )

    assert mapping_response.status_code == 201
    mapping = mapping_response.json()
    assert mapping["symptom"] == "Rash"
    assert mapping["specialization"] == "Dermatology"

    list_response = client.get(MAPPINGS_URL, headers=headers)
    assert list_response.status_code == 200
    mappings = list_response.json()["mappings"]
    assert any(m["symptom"] == "Rash" and m["specialization"] == "Dermatology" for m in mappings)


def test_tc039_non_admin_and_unauthenticated_attempts_to_manage_specializations_are_denied(
    client: TestClient, db_session: DBSession
) -> None:
    admin_headers = _admin_headers(db_session)
    create_response = client.post(
        SPECIALIZATIONS_URL, json={"name": "Radiology"}, headers=admin_headers
    )
    spec_id = create_response.json()["id"]

    _, doctor_headers = _bearer(
        db_session, "doctor", "signedin-doctor-tc039@clinic.com", "Dr. Signed In"
    )

    create_as_doctor = client.post(
        SPECIALIZATIONS_URL, json={"name": "Immunology"}, headers=doctor_headers
    )
    assert create_as_doctor.status_code == 403

    rename_as_doctor = client.put(
        SPECIALIZATIONS_URL,
        json={"id": spec_id, "name": "Radiology Plus"},
        headers=doctor_headers,
    )
    assert rename_as_doctor.status_code == 403

    delete_as_doctor = client.request(
        "DELETE", SPECIALIZATIONS_URL, json={"id": spec_id}, headers=doctor_headers
    )
    assert delete_as_doctor.status_code == 403

    create_unauthenticated = client.post(SPECIALIZATIONS_URL, json={"name": "Immunology"})
    assert create_unauthenticated.status_code == 401

    names = _specialization_names(client, admin_headers)
    assert "Radiology" in names
    assert "Immunology" not in names
    assert "Radiology Plus" not in names


def test_tc040_deleting_a_specialization_assigned_to_a_doctor_is_warned_about_or_blocked(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    create_response = client.post(
        SPECIALIZATIONS_URL, json={"name": "Neurosurgery"}, headers=headers
    )
    spec_id = create_response.json()["id"]

    doctor_response = client.post(
        USERS_URL,
        json={
            "full_name": "Dr. Neuro",
            "email": "dr-neuro-tc040@clinic.com",
            "phone": "+1 555 0191",
            "role": "doctor",
            "specialization": "Neurosurgery",
        },
        headers=headers,
    )
    assert doctor_response.status_code == 201

    delete_response = client.request(
        "DELETE", SPECIALIZATIONS_URL, json={"id": spec_id}, headers=headers
    )

    assert delete_response.status_code >= 400
    detail_text = str(delete_response.json()).lower()
    assert "doctor" in detail_text or "depend" in detail_text

    assert "Neurosurgery" in _specialization_names(client, headers)

    doctor = db_session.query(User).filter(User.email == "dr-neuro-tc040@clinic.com").first()
    assert doctor is not None
    assert doctor.specialization == "Neurosurgery"


def test_tc041_deleting_a_specialization_used_in_the_mapping_table_is_warned_about_or_blocked(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    create_response = client.post(SPECIALIZATIONS_URL, json={"name": "Oncology"}, headers=headers)
    spec_id = create_response.json()["id"]

    mapping_response = client.post(
        MAPPINGS_URL,
        json={"symptom": "Fatigue", "specialization": "Oncology"},
        headers=headers,
    )
    assert mapping_response.status_code == 201

    delete_response = client.request(
        "DELETE", SPECIALIZATIONS_URL, json={"id": spec_id}, headers=headers
    )

    assert delete_response.status_code >= 400
    detail_text = str(delete_response.json()).lower()
    assert "mapping" in detail_text or "depend" in detail_text

    assert "Oncology" in _specialization_names(client, headers)

    list_response = client.get(MAPPINGS_URL, headers=headers)
    assert list_response.status_code == 200
    mappings = list_response.json()["mappings"]
    assert any(m["symptom"] == "Fatigue" and m["specialization"] == "Oncology" for m in mappings)
