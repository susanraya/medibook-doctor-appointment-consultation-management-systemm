"""Authentication: registration, sign-in and sign-out.

Stubs only -- the approved paths exist so the OpenAPI document and the
frontend's generated calls resolve before a single handler has real
behaviour. See `app.security` for the password hashing and opaque session
token the real implementation uses, and `app.models.Session` for where a
token is stored and revoked.
"""

from fastapi import APIRouter

from app.schemas import StubResponse

router = APIRouter(tags=["auth"])


@router.post("/auth/register", response_model=StubResponse)
async def register() -> StubResponse:
    return StubResponse(endpoint="POST /auth/register")


@router.post("/auth/login", response_model=StubResponse)
async def login() -> StubResponse:
    return StubResponse(endpoint="POST /auth/login")


@router.post("/auth/logout", status_code=204)
async def logout() -> None:
    return None
