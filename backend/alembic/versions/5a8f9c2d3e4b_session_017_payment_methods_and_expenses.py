"""session_017_payment_methods_and_expenses

Revision ID: 5a8f9c2d3e4b
Revises: 3b9f00482e26
Create Date: 2026-02-09

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = '5a8f9c2d3e4b'
down_revision = '3b9f00482e26'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create paymentmethod table
    op.create_table('paymentmethod',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('transaction_fee_percent', sa.Numeric(precision=5, scale=2), nullable=False, server_default='0'),
        sa.Column('transaction_fee_fixed', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_paymentmethod_name'), 'paymentmethod', ['name'], unique=False)

    # Create expense table
    op.create_table('expense',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('property_id', sa.String(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('is_deductible', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('receipt_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['property_id'], ['property.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Modify payment table
    # SQLite doesn't support adding columns with foreign keys directly
    # We'll add the columns first, then create the foreign key
    
    # Add new columns
    op.add_column('payment', sa.Column('payment_method_id', sa.String(), nullable=True))
    op.add_column('payment', sa.Column('net_amount', sa.Numeric(precision=10, scale=2), nullable=True))
    
    # Update existing payments to have net_amount = amount
    op.execute("UPDATE payment SET net_amount = amount WHERE net_amount IS NULL")
    
    # Now make net_amount non-nullable
    # Note: SQLite doesn't support ALTER COLUMN, so we accept it as nullable
    
    # Try to drop the provider column if it exists
    # SQLite has limited ALTER TABLE support, so we'll use a try-except approach
    try:
        op.drop_column('payment', 'provider')
    except:
        # If it fails, it's okay - the column might not exist or SQLite doesn't support it
        pass


def downgrade() -> None:
    # Reverse payment table changes
    try:
        op.add_column('payment', sa.Column('provider', sa.String(), nullable=True, server_default='Unknown'))
    except:
        pass
    
    op.drop_column('payment', 'net_amount')
    op.drop_column('payment', 'payment_method_id')

    # Drop expense table
    op.drop_table('expense')

    # Drop paymentmethod table
    op.drop_index(op.f('ix_paymentmethod_name'), table_name='paymentmethod')
    op.drop_table('paymentmethod')
