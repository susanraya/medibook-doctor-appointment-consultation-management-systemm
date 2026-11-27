"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, ValidationInfo, field_validator


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
    """POST /admin/users's body: a doctor or admin account (US-003). A doctor
    account also carries the specialization that places them in patient
    search (AC-048); an admin account carries none."""

    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=32, pattern=r"^[0-9+\-() ]+$")
    role: Literal["doctor", "admin"]
    specialization_id: str | None = None

    @field_validator("specialization_id")
    @classmethod
    def _specialization_required_for_doctor(
        cls, value: str | None, info: ValidationInfo
    ) -> str | None:
        if info.data.get("role") == "doctor" and not value:
            raise ValueError("A doctor account requires a specialization")
        return value


class AdminUserOut(BaseModel):
    """A provisioned staff account. password_status is a placeholder or 'set',
    never a credential (NFR-010). specialization_id is set for a doctor,
    reflecting the profile patient search reads (AC-048), and None for an
    admin."""

    id: str
    full_name: str
    email: str
    phone: str
    role: str
    is_active: bool
    password_status: str
    specialization_id: str | None = None


class AdminUserListOut(BaseModel):
    users: list[AdminUserOut]


class UserStatusUpdateRequest(BaseModel):
    is_active: bool


class UserStatusOut(BaseModel):
    id: str
    is_active: bool


class DoctorStatusUpdateRequest(BaseModel):
    """PUT /admin/doctors/{doctor_id}/status's body (AC-049)."""

    is_active: bool


class DoctorStatusOut(BaseModel):
    """PUT /admin/doctors/{doctor_id}/status's response: confirms the toggle
    and, on deactivation, lists the appointments flagged for reassignment or
    cancellation so the admin can act on them (AC-049)."""

    id: str
    is_active: bool
    flagged_appointment_ids: list[str] = []


class SpecializationCreateRequest(BaseModel):
    """POST /admin/specializations's body: adds a new specialization (AC-050)."""

    name: str = Field(min_length=1, max_length=255)


class SpecializationUpdateRequest(BaseModel):
    """PUT /admin/specializations's body: renames an existing specialization
    (AC-050). `id` names which one, since the path carries none."""

    id: str
    name: str = Field(min_length=1, max_length=255)


class SpecializationOut(BaseModel):
    """One entry in the admin-defined specialization list (AC-050)."""

    id: str
    name: str
    is_active: bool


class SpecializationListOut(BaseModel):
    """GET /admin/specializations's response: every specialization, reflecting
    additions, renames and removals as soon as they happen (AC-050)."""

    specializations: list[SpecializationOut]


class SpecializationDeleteOut(BaseModel):
    """DELETE /admin/specializations's response on success: confirms the
    removal once no doctor or mapping depends on it (AC-051)."""

    id: str
    deleted: bool = True


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
