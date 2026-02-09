"""
Finance Module Models
Handles PaymentMethod and Expense entities for financial tracking
"""

import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class PaymentMethod(SQLModel, table=True):
    """
    Configurable payment methods with transaction fees.
    Replaces hardcoded provider strings.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)  # Stripe, Cash, Bank Transfer, etc.
    transaction_fee_percent: Decimal = Field(default=0, max_digits=5, decimal_places=2)  # e.g., 2.9 for 2.9%
    transaction_fee_fixed: Decimal = Field(default=0, max_digits=10, decimal_places=2)  # e.g., 0.30 for $0.30
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    payments: List["Payment"] = Relationship(back_populates="payment_method")


class Expense(SQLModel, table=True):
    """
    Property expenses for financial reporting and owner payouts.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    property_id: uuid.UUID = Field(foreign_key="property.id")
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    date: date
    category: str  # Maintenance, Utilities, Cleaning, Supplies, etc.
    description: str
    is_deductible: bool = Field(default=True)  # Tax deductible from owner payout
    receipt_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    property: "Property" = Relationship(back_populates="expenses")
