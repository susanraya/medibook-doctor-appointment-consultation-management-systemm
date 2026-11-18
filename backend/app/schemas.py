"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented.
"""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """POST /auth/register's body. Validated at the boundary (AC-003)."""

    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=32, pattern=r"^[0-9+\-() ]+$")
    password: str = Field(min_length=8, max_length=255)


class LoginRequest(BaseModel):
    """POST /auth/login's body. Plain `str` for email on purpose: a malformed
    email here must fail the same generic way an unknown one does (AC-005,
    NFR-003), not leak anything through a format-specific 422."""

    email: str
    password: str = Field(min_length=1)


class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    role: str
    is_active: bool


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."
