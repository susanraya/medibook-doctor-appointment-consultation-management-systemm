"""Alembic environment: points migrations at this app's models and DATABASE_URL.

Run from the `backend/` directory: `.venv/bin/alembic upgrade head`. Reads
`DATABASE_URL` the same way `app.database` does, so the same environment
variable that configures the running app also configures its migrations.
"""

import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import models  # noqa: E402,F401 -- registers tables on Base.metadata
from app.database import Base  # noqa: E402

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

_database_url = os.getenv("DATABASE_URL", "sqlite:///./app.db")
# `%` is ConfigParser's interpolation character; a password containing one would
# otherwise break `set_main_option`.
config.set_main_option("sqlalchemy.url", _database_url.replace("%", "%%"))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
