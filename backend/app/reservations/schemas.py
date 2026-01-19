from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from sqlmodel import SQLModel

# Channel Schemas
class ChannelBase(SQLModel):
    name: str
    external: bool = True

class ChannelCreate(ChannelBase):
    pass

class ChannelRead(ChannelBase):
    id: UUID
    created_at: datetime

# Charge Schemas
class ChargeBase(SQLModel):
    reservation_id: UUID
    type: str
    description: str
    amount: Decimal
    beneficiary: str
    paid: bool = False

class ChargeCreate(ChargeBase):
    pass

class ChargeRead(ChargeBase):
    id: UUID
    created_at: datetime

# Payment Schemas
class PaymentBase(SQLModel):
    reservation_id: UUID
    amount: Decimal
    payment_type: str
    non_refundable: bool = True
    provider: str
    beneficiary: str
    percentage_applied: Decimal
    status: str = "pending"
    paid_at: Optional[datetime] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(SQLModel):
    amount: Optional[Decimal] = None
    payment_type: Optional[str] = None
    non_refundable: Optional[bool] = None
    provider: Optional[str] = None
    beneficiary: Optional[str] = None
    percentage_applied: Optional[Decimal] = None
    status: Optional[str] = None
    paid_at: Optional[datetime] = None

class PaymentRead(PaymentBase):
    id: UUID
    created_at: datetime

# Reservation Schemas
class ReservationBase(SQLModel):
    property_id: UUID
    guest_id: Optional[UUID] = None
    channel_id: Optional[UUID] = None
    reservation_type: str = "commercial"
    start_date: date
    end_date: date
    guest_count: int
    total_amount: Decimal = Decimal("0.00")
    status: str = "confirmed"

class ReservationCreate(ReservationBase):
    pass

class ReservationUpdate(SQLModel):
    property_id: Optional[UUID] = None
    guest_id: Optional[UUID] = None
    channel_id: Optional[UUID] = None
    reservation_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    guest_count: Optional[int] = None
    total_amount: Optional[Decimal] = None
    status: Optional[str] = None

class ReservationRead(ReservationBase):
    id: UUID
    created_at: datetime

class ReservationDetail(ReservationRead):
    payments: List[PaymentRead] = []
    charges: List[ChargeRead] = []
