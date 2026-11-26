"""Authentication: registration, sign-in, sign-out and the signed-in profile.

See `app.deps` for the bearer-token guard every other protected endpoint will
use, and `app.sessions` for where a token is issued and revoked.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.deps import get_current_session, get_current_user
from app.models import STAFF_PASSWORD_PLACEHOLDER, User
from app.models import Session as SessionModel
from app.schemas import (
    AuthResponse,
    FirstLoginPasswordRequest,
    LoginRequest,
    RegisterRequest,
    UserOut,
)
from app.security import hash_password, verify_password
from app.sessions import create_session, revoke_session

router = APIRouter(tags=["auth"])

_db = Depends(get_db)
_session = Depends(get_current_session)
_current_user = Depends(get_current_user)


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
    )


@router.post("/auth/register", response_model=AuthResponse, status_code=201)
async def register(payload: RegisterRequest, db: DBSession = _db) -> AuthResponse:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing is not None:
        raise HTTPException(status_code=409, detail="That email is already in use")

    user = User(
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role="patient",
        full_name=payload.full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_session(db, user)
    return AuthResponse(token=token, user=_user_out(user))


@router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: DBSession = _db) -> AuthResponse:
    # One generic failure for an unknown email, a wrong password, or a deactivated
    # account (NFR-003): nothing here tells those three cases apart from outside.
    generic_failure = HTTPException(status_code=401, detail="Email or password is incorrect.")
    user = db.query(User).filter(User.email == payload.email).first()
    # A provisioned staff account has no password_hash until first-login-password is
    # set: treat it the same as a wrong password rather than crash verify_password.
    if user is None or user.password_hash is None:
        raise generic_failure
    if not verify_password(payload.password, user.password_hash):
        raise generic_failure
    if not user.is_active:
        raise generic_failure

    token = create_session(db, user)
    return AuthResponse(token=token, user=_user_out(user))


@router.post("/auth/first-login-password", response_model=AuthResponse)
async def set_first_login_password(
    payload: FirstLoginPasswordRequest, db: DBSession = _db
) -> AuthResponse:
    already_set = HTTPException(status_code=400, detail="Password is already set")
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or user.password_status != STAFF_PASSWORD_PLACEHOLDER:
        raise already_set

    user.password_hash = hash_password(payload.password)
    user.password_status = "set"
    db.commit()
    db.refresh(user)

    session_token = create_session(db, user)
    return AuthResponse(token=session_token, user=_user_out(user))


@router.post("/auth/logout", status_code=204)
async def logout(session: SessionModel = _session, db: DBSession = _db) -> None:
    revoke_session(db, session.token)
    return None


@router.get("/auth/me", response_model=UserOut)
async def me(user: User = _current_user) -> UserOut:
    return _user_out(user)
