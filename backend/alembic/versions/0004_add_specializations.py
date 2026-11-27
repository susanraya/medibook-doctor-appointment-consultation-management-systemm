"""create specializations table

Revision ID: 0004
Revises: 0003
Create Date: 2026-11-27

Additive only: establishes the `specializations` table explicitly, the way
0001 established `users` and `sessions`, since this ticket (US-021) owns its
full lifecycle -- add, rename, delete with dependency checks against
`doctor_profiles` and `disease_mapping_specializations`. `Base.metadata.create_all`
already creates this table with the same shape for a database that has never
run this migration (see `app.main.lifespan`), so this only has work to do
against a database that was never migrated this far; nothing is renamed or
dropped either way.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "specializations" not in existing_tables:
        op.create_table(
            "specializations",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        )

    existing_indexes = (
        {ix["name"] for ix in inspector.get_indexes("specializations")}
        if "specializations" in existing_tables
        else set()
    )
    if "ix_specializations_name" not in existing_indexes:
        op.create_index("ix_specializations_name", "specializations", ["name"], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "specializations" not in inspector.get_table_names():
        return
    op.drop_index("ix_specializations_name", table_name="specializations")
    op.drop_table("specializations")
