"""create disease_mappings and disease_mapping_specializations tables

Revision ID: 0005
Revises: 0004
Create Date: 2026-11-27

Additive only: establishes the `disease_mappings` and
`disease_mapping_specializations` tables explicitly, the way 0004 established
`specializations`, since this ticket (US-022) owns their full lifecycle --
add, edit, remove, each entry validated against `specializations`.
`Base.metadata.create_all` already creates these tables with the same shape
for a database that has never run this migration (see `app.main.lifespan`),
so this only has work to do against a database that was never migrated this
far; nothing is renamed or dropped either way.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "disease_mappings" not in existing_tables:
        op.create_table(
            "disease_mappings",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("term", sa.String(length=255), nullable=False),
        )

    existing_indexes = (
        {ix["name"] for ix in inspector.get_indexes("disease_mappings")}
        if "disease_mappings" in existing_tables
        else set()
    )
    if "ix_disease_mappings_term" not in existing_indexes:
        op.create_index("ix_disease_mappings_term", "disease_mappings", ["term"], unique=True)

    existing_tables = set(inspector.get_table_names())
    if "disease_mapping_specializations" not in existing_tables:
        op.create_table(
            "disease_mapping_specializations",
            sa.Column(
                "mapping_id",
                sa.String(length=36),
                sa.ForeignKey("disease_mappings.id"),
                primary_key=True,
            ),
            sa.Column(
                "specialization_id",
                sa.String(length=36),
                sa.ForeignKey("specializations.id"),
                primary_key=True,
            ),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())
    if "disease_mapping_specializations" in existing_tables:
        op.drop_table("disease_mapping_specializations")
    if "disease_mappings" in existing_tables:
        op.drop_index("ix_disease_mappings_term", table_name="disease_mappings")
        op.drop_table("disease_mappings")
