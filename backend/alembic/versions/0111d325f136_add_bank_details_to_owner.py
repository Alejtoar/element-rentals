"""add_bank_details_to_owner

Revision ID: 0111d325f136
Revises: 47d911ad4cb0
Create Date: 2026-02-06 18:16:15.669928

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0111d325f136'
down_revision: Union[str, Sequence[str], None] = '47d911ad4cb0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add bank_details column to owner table for Phase 2 payout functionality."""
    op.add_column('owner', sa.Column('bank_details', sa.String(), nullable=True))


def downgrade() -> None:
    """Remove bank_details column from owner table."""
    op.drop_column('owner', 'bank_details')

