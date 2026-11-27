"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented.
"""

from datetime import datetime
from typing import Literal

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


class AdminCreateUserRequest(BaseModel):
    """POST /admin/users's body: a doctor or admin account (US-003)."""

    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=32, pattern=r"^[0-9+\-() ]+$")
    role: Literal["doctor", "admin"]


class AdminUserOut(BaseModel):
    """A provisioned staff account. password_status is a placeholder or 'set',
    never a credential (NFR-010)."""

    id: str
    full_name: str
    email: str
    phone: str
    role: str
    is_active: bool
    password_status: str


class AdminUserListOut(BaseModel):
    users: list[AdminUserOut]


class UserStatusUpdateRequest(BaseModel):
    is_active: bool


class UserStatusOut(BaseModel):
    id: str
    is_active: bool


class FirstLoginPasswordRequest(BaseModel):
    """POST /auth/first-login-password's body."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=255)


class ProfileOut(BaseModel):
    """GET /me/profile's response, and PUT /me/profile's on success (AC-014)."""

    id: str
    full_name: str
    email: str
    phone: str
    role: str


class ProfileUpdateRequest(BaseModel):
    """PUT /me/profile's body: the whole profile, saved as given once every field
    is valid (AC-014). Same shape and validation as registration."""

    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=32, pattern=r"^[0-9+\-() ]+$")


class ConsentRequest(BaseModel):
    """POST /me/consent's body. Calling this endpoint as the signed-in patient is
    itself the explicit acceptance (AC-016); `accepted` must be sent as `true` so
    a client cannot record consent by posting a decline."""

    accepted: Literal[True]


class ConsentOut(BaseModel):
    """POST /me/consent's response: the recorded consent with its audit
    timestamp (AC-017)."""

    consented: bool
    consented_at: datetime


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."
