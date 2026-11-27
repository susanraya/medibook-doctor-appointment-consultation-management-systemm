"""add needs_reassignment to appointments

Revision ID: 0003
Revises: 0002
Create Date: 2026-11-27

Additive only: adds a column (with a server default so existing rows read
False) marking an appointment whose doctor was deactivated while it was still
scheduled, so an admin can reassign or cancel it (US-020, AC-049).

`appointments` is not one of the tables an earlier migration created -- like
every table besides `users`/`sessions`, it is still created by
`Base.metadata.create_all` at startup (see `app.main.lifespan`). A database
that has never started the application therefore has no such table yet, and
`create_all` will create it with this column already in place; this migration
only has work to do against a database that created it before this column
existed.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "appointments" not in inspector.get_table_names():
        return

    existing_columns = {c["name"] for c in inspector.get_columns("appointments")}
    if "needs_reassignment" not in existing_columns:
        op.add_column(
            "appointments",
            sa.Column(
                "needs_reassignment", sa.Boolean(), nullable=False, server_default=sa.false()
            ),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "appointments" not in inspector.get_table_names():
        return
    existing_columns = {c["name"] for c in inspector.get_columns("appointments")}
    if "needs_reassignment" in existing_columns:
        op.drop_column("appointments", "needs_reassignment")
