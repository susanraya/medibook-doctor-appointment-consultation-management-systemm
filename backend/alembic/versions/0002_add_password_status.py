"""add password_status to users, allow password_hash to be null

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-20

Additive only: adds a column (with a server default so existing rows read
'set', matching the credential every pre-existing user already has) and
loosens password_hash's NOT NULL constraint so a staff account an admin
provisions can be stored with no real credential until first login (US-003,
NFR-010). Nothing is renamed or dropped.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {c["name"] for c in inspector.get_columns("users")}

    if "password_status" not in existing_columns:
        op.add_column(
            "users",
            sa.Column(
                "password_status", sa.String(length=32), nullable=False, server_default="set"
            ),
        )

    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("password_hash", existing_type=sa.String(length=255), nullable=True)


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("password_hash", existing_type=sa.String(length=255), nullable=False)
    op.drop_column("users", "password_status")
