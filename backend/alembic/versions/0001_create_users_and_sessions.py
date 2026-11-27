"""create users and sessions tables

Revision ID: 0001
Revises:
Create Date: 2026-11-18

Additive only: the first migration this project has, so it establishes the
`users` and `sessions` tables the auth core (US-002-1) needs. Other tables
in `app.models` still come from `Base.metadata.create_all` at startup until
a ticket that touches them adds its own migration -- create_all is a no-op
against a table that already exists, so the two do not conflict.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # The sandbox reuses a database file across runs, and earlier (pre-migration)
    # app startups created these same tables via `Base.metadata.create_all` before
    # this migration existed, with no `alembic_version` row to show for it. Inspect
    # for that case and skip the DDL rather than fail on "table already exists";
    # `alembic upgrade head` still records this revision as applied either way.
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("email", sa.String(length=320), nullable=False),
            sa.Column("phone", sa.String(length=32), nullable=False, server_default=""),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.Column("role", sa.String(length=16), nullable=False),
            sa.Column("full_name", sa.String(length=255), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )

    # NFR-012: email is looked up on every login/register.
    existing_user_indexes = (
        {ix["name"] for ix in inspector.get_indexes("users")}
        if ("users" in existing_tables)
        else set()
    )
    if "ix_users_email" not in existing_user_indexes:
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    if "sessions" not in existing_tables:
        op.create_table(
            "sessions",
            sa.Column("token", sa.String(length=64), primary_key=True),
            sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("last_activity_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        )

    existing_session_indexes = (
        {ix["name"] for ix in inspector.get_indexes("sessions")}
        if ("sessions" in existing_tables)
        else set()
    )
    if "ix_sessions_user_id" not in existing_session_indexes:
        op.create_index("ix_sessions_user_id", "sessions", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_sessions_user_id", table_name="sessions")
    op.drop_table("sessions")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
