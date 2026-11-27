"""Centralised environment settings, each with a safe local default.

Every variable here is one the deployment platform injects for the running
container; `backend/scripts/check_connections.py` also discovers this module
by name (see `SETTINGS_MODULES` there) and reads its `settings` object ahead
of raw `os.environ`, so values set here are what that script reports on too.

Nothing in this module is a credential literal: every value is read from the
environment, and the local defaults below are not secrets -- they are only
good enough to run this repository on a laptop with nothing else configured.
"""

import os
from functools import lru_cache


class Settings:
    def __init__(self) -> None:
        # Backing services (see ENVIRONMENT.md).
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./app.db")
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

        # Platform-provided, always set on the deployed API.
        self.allowed_origins = [
            origin.strip()
            for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
            if origin.strip()
        ]
        # Not a secret despite the name: it is the public bearer value the generated
        # frontend sends on every call, used only to compare against incoming
        # requests. Never sign anything with it.
        self.secret_key = os.getenv("SECRET_KEY", "local-dev-secret-key")
        # Private: signs session material. Never sent to the frontend, never logged.
        self.jwt_secret_key = os.getenv("JWT_SECRET_KEY", "local-dev-jwt-secret-key")

        # Platform-provided only on the deployed API (and in CI/E2E runs); unset here
        # and in a bare `pytest` run, where nothing should be seeded.
        self.bootstrap_admin_email = os.getenv("BOOTSTRAP_ADMIN_EMAIL")
        self.bootstrap_admin_password = os.getenv("BOOTSTRAP_ADMIN_PASSWORD")
        self.smoke_test_email = os.getenv("SMOKE_TEST_EMAIL")
        self.smoke_test_password = os.getenv("SMOKE_TEST_PASSWORD")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
