"""add property description

Revision ID: e4a8d1c7f0b2
Revises: 5a8f9c2d3e4b
Create Date: 2026-02-23

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = 'e4a8d1c7f0b2'
down_revision = '5a8f9c2d3e4b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add description column to property table
    op.add_column('property', sa.Column('description', sa.String(), nullable=True))
    # Update existing properties to have an empty string as description
    op.execute("UPDATE property SET description = '' WHERE description IS NULL")
    # Now make it non-nullable if desired, but for text it's better to allow nulls or just use empty strings.
    # SQLModel model has description: str = Field(default=""), so it expects a string.
    # In Postgres, we can't easily change nullability without issues if there is data, but we just updated it.
    # However, keeping it nullable=True is safer for migrations.


def downgrade() -> None:
    op.drop_column('property', 'description')
