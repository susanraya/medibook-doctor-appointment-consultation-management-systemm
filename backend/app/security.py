"""Password hashing and opaque session tokens.

Shared by whichever router implements `/auth/register` and `/auth/login`
first, and by the startup seeding in `app.seed` -- added now so that work has
one place to hash a password rather than each inventing its own scheme.

Sessions are opaque tokens stored in the `sessions` table (NFR per the
architecture notes), never JSON Web Tokens: the frontend and API are on
different origins, so the token travels in the response body and as an
`Authorization: Bearer` header, not a cookie.
"""

import secrets

from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """A bcrypt hash of ``password``. Never store the plain password itself."""
    return _pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Whether ``password`` matches a hash `hash_password` produced earlier."""
    return _pwd_context.verify(password, password_hash)


def generate_session_token() -> str:
    """A new, unguessable opaque session token."""
    return secrets.token_urlsafe(32)
