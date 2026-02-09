"""
Finance Module Schemas
Pydantic schemas for PaymentMethod and Expense
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel


# PaymentMethod Schemas
class PaymentMethodBase(SQLModel):
    name: str
    transaction_fee_percent: Decimal = Decimal("0.00")
    transaction_fee_fixed: Decimal = Decimal("0.00")
    is_active: bool = True


class PaymentMethodCreate(PaymentMethodBase):
    pass


class PaymentMethodUpdate(SQLModel):
    name: Optional[str] = None
    transaction_fee_percent: Optional[Decimal] = None
    transaction_fee_fixed: Optional[Decimal] = None
    is_active: Optional[bool] = None


class PaymentMethodRead(PaymentMethodBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# Expense Schemas
class ExpenseBase(SQLModel):
    property_id: uuid.UUID
    amount: Decimal
    date: date
    category: str
    description: str
    is_deductible: bool = True
    receipt_url: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(SQLModel):
    property_id: Optional[uuid.UUID] = None
    amount: Optional[Decimal] = None
    date: Optional[date] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_deductible: Optional[bool] = None
    receipt_url: Optional[str] = None


class ExpenseRead(ExpenseBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
