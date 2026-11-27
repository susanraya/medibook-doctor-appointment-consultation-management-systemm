"""Integration tests for US-022: maintain the disease/symptom-to-specialization
mapping table (AC-052, AC-053).

No OpenAPI spec is available for this sprint (as in the sibling
`test_specializations.py`), so the exact JSON shape of `/admin/mappings` is
read straight off the reviewed test cases' own test data, which (unlike the
earlier US-021 cases) name the field `specializations` -- a *list* of
specialization names, not a single `specialization` string:

- `POST /admin/mappings` takes `{"symptom": ..., "specializations": [...]}`
  and returns the created record, including `id`, status 201.
- `PUT /admin/mappings` takes `{"id": <id>, "specializations": [...]}` (the
  case's own steps give no `symptom` field for the edit) and returns the
  updated record, status 200.
- `DELETE /admin/mappings` takes `{"id": <id>}` in the JSON body, sent via
  `client.request("DELETE", ..., json=...)` because httpx's `delete()`
  helper does not accept a body -- as established in `test_specializations.py`.
- `GET /admin/mappings` returns `{"mappings": [...]}`; a case's own test
  data names a `symptom` query filter (`query: symptom = Insomnia`), passed
  as a query param, but the assertions below also work if the endpoint
  ignores it and returns the full list, by filtering client-side too.
- A mapping to a specialization that does not exist is a validation failure,
  asserted as `422` by analogy with the equivalent doctor-specialization
  validation in `test_doctor_management.py` (TC-022, TC-024).
- Patient search resolving a symptom to specializations is read through
  `GET /search/doctors`, which already accepts a `specialization` query
  param (`test_doctor_management.py`); for a symptom-based lookup this file
  assumes the analogous `symptom` query param, since the case gives no field
  name beyond "query: Chest pain".
- A doctor's specialization is set via `POST /admin/users` (the existing
  provisioning endpoint), and specializations are created up front via
  `POST /admin/specializations`, exactly as in `test_specializations.py` and
  `test_doctor_management.py`.

See the task report's risk note for where these readings are unverified.
"""

import secrets

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session as DBSession

from app.models import User
from app.security import hash_password
from app.sessions import create_session

MAPPINGS_URL = "/admin/mappings"
SPECIALIZATIONS_URL = "/admin/specializations"
SEARCH_URL = "/search/doctors"
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


def _admin_headers(db: DBSession, email: str = "admin-us022@example.com") -> dict:
    _, headers = _bearer(db, "admin", email, "Admin User")
    return headers


def _create_specialization(client: TestClient, headers: dict, name: str) -> str:
    response = client.post(SPECIALIZATIONS_URL, json={"name": name}, headers=headers)
    assert response.status_code == 201
    return response.json()["id"]


def _create_doctor(
    client: TestClient, headers: dict, full_name: str, email: str, specialization: str
) -> dict:
    payload = {
        "full_name": full_name,
        "email": email,
        "phone": "+1 555 0190",
        "role": "doctor",
        "specialization": specialization,
    }
    response = client.post(USERS_URL, json=payload, headers=headers)
    assert response.status_code == 201
    return response.json()


def test_tc013_add_mapping_entry_is_saved_and_immediately_used_by_search(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    _create_specialization(client, headers, "Cardiology")
    _create_doctor(client, headers, "Dr. Cora Hart", "cora.hart-tc013@clinic.com", "Cardiology")

    create_response = client.post(
        MAPPINGS_URL,
        json={"symptom": "Chest pain", "specializations": ["Cardiology"]},
        headers=headers,
    )

    assert create_response.status_code == 201
    created = create_response.json()
    assert "id" in created

    search_response = client.get(SEARCH_URL, params={"symptom": "Chest pain"})

    assert search_response.status_code == 200
    doctors = search_response.json()["doctors"]
    assert any(d["full_name"] == "Dr. Cora Hart" for d in doctors)


def test_tc014_edit_mapping_entry_updates_search_results_immediately(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    _create_specialization(client, headers, "Cardiology")
    _create_specialization(client, headers, "Internal Medicine")
    _create_doctor(client, headers, "Dr. Cora Hart", "cora.hart-tc014@clinic.com", "Cardiology")
    _create_doctor(
        client, headers, "Dr. Ian Mercer", "ian.mercer-tc014@clinic.com", "Internal Medicine"
    )

    create_response = client.post(
        MAPPINGS_URL,
        json={"symptom": "Chest pain", "specializations": ["Cardiology"]},
        headers=headers,
    )
    assert create_response.status_code == 201
    mapping_id = create_response.json()["id"]

    edit_response = client.put(
        MAPPINGS_URL,
        json={"id": mapping_id, "specializations": ["Cardiology", "Internal Medicine"]},
        headers=headers,
    )

    assert edit_response.status_code == 200

    search_response = client.get(SEARCH_URL, params={"symptom": "Chest pain"})

    assert search_response.status_code == 200
    names = {d["full_name"] for d in search_response.json()["doctors"]}
    assert "Dr. Cora Hart" in names
    assert "Dr. Ian Mercer" in names


def test_tc015_remove_mapping_entry_stops_it_being_used_by_search(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    _create_specialization(client, headers, "Cardiology")
    _create_doctor(client, headers, "Dr. Cora Hart", "cora.hart-tc015@clinic.com", "Cardiology")

    create_response = client.post(
        MAPPINGS_URL,
        json={"symptom": "Chest pain", "specializations": ["Cardiology"]},
        headers=headers,
    )
    assert create_response.status_code == 201
    mapping_id = create_response.json()["id"]

    delete_response = client.request(
        "DELETE", MAPPINGS_URL, json={"id": mapping_id}, headers=headers
    )

    assert delete_response.status_code in (200, 204)

    search_response = client.get(SEARCH_URL, params={"symptom": "Chest pain"})

    assert search_response.status_code == 200
    assert search_response.json()["doctors"] == []


def test_tc018_adding_a_mapping_to_a_non_existent_specialization_is_rejected(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)

    create_response = client.post(
        MAPPINGS_URL,
        json={"symptom": "Insomnia", "specializations": ["QuantumHealing"]},
        headers=headers,
    )

    assert create_response.status_code == 422

    list_response = client.get(MAPPINGS_URL, params={"symptom": "Insomnia"}, headers=headers)
    assert list_response.status_code == 200
    mappings = list_response.json()["mappings"]
    assert not any(m["symptom"] == "Insomnia" for m in mappings)


def test_tc019_editing_a_mapping_to_a_non_existent_specialization_is_rejected(
    client: TestClient, db_session: DBSession
) -> None:
    headers = _admin_headers(db_session)
    _create_specialization(client, headers, "Neurology")

    create_response = client.post(
        MAPPINGS_URL,
        json={"symptom": "Migraine", "specializations": ["Neurology"]},
        headers=headers,
    )
    assert create_response.status_code == 201
    mapping_id = create_response.json()["id"]

    edit_response = client.put(
        MAPPINGS_URL,
        json={"id": mapping_id, "specializations": ["QuantumHealing"]},
        headers=headers,
    )

    assert edit_response.status_code == 422

    list_response = client.get(MAPPINGS_URL, params={"symptom": "Migraine"}, headers=headers)
    assert list_response.status_code == 200
    mappings = list_response.json()["mappings"]
    migraine_mapping = next((m for m in mappings if m["symptom"] == "Migraine"), None)
    assert migraine_mapping is not None
    assert migraine_mapping["specializations"] == ["Neurology"]
