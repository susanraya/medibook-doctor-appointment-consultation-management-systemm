"""Every router mounts and answers before any handler has real behaviour.

Not a test of business logic -- there isn't any yet -- just proof that the
scaffolded routes resolve, so a routing typo fails here rather than on the
first ticket that tries to call one of them.
"""

from fastapi.testclient import TestClient


def test_stub_endpoints_resolve(client: TestClient) -> None:
    # /auth/register, /auth/login and /auth/logout are implemented (US-002-1);
    # see tests/integration/test_auth.py for their real behaviour.
    assert client.get("/me/profile").status_code == 200
    assert client.get("/search/doctors").status_code == 200
    assert client.get("/doctors/doc-1/slots").status_code == 200
    assert client.post("/appointments").status_code == 201
    # [AC-011] [AC-012] /doctor/appointments and /admin/audit-logs enforce
    # require_role("doctor") / require_role("admin"): an unauthenticated
    # caller is denied, not routed through to a 200 stub response.
    assert client.get("/doctor/appointments").status_code == 401
    assert client.get("/admin/specializations").status_code == 200
    assert client.get("/admin/audit-logs").status_code == 401


def test_every_approved_path_is_in_the_openapi_document(client: TestClient) -> None:
    paths = client.get("/openapi.json").json()["paths"]
    for path in (
        "/auth/register",
        "/auth/login",
        "/auth/logout",
        "/admin/users",
        "/me/profile",
        "/me/consent",
        "/search/doctors",
        "/doctors/{doctor_id}/slots",
        "/me/availability",
        "/admin/doctors/{doctor_id}/availability",
        "/appointments",
        "/appointments/{id}/reschedule",
        "/appointments/{id}/cancel",
        "/me/appointments",
        "/doctor/appointments",
        "/appointments/{id}/consultation",
        "/appointments/{id}/status",
        "/admin/appointments",
        "/admin/appointments/{id}/reassign",
        "/admin/specializations",
        "/admin/mappings",
        "/admin/doctors/{doctor_id}/status",
        "/admin/audit-logs",
        "/admin/email-settings",
    ):
        assert path in paths, f"{path} is missing from the OpenAPI document"
