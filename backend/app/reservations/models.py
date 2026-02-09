import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Channel(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str # Airbnb, Booking, Manual
    external: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Reservation(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    property_id: uuid.UUID = Field(foreign_key="property.id")
    guest_id: Optional[uuid.UUID] = Field(default=None, foreign_key="guest.id")
    channel_id: Optional[uuid.UUID] = Field(default=None, foreign_key="channel.id")
    reservation_type: str = Field(default="commercial") # commercial, owner_use
    start_date: date
    end_date: date
    guest_count: int
    total_amount: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    status: str = Field(default="confirmed") # confirmed, cancelled, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    property: "Property" = Relationship(back_populates="reservations")
    guest: Optional["Guest"] = Relationship(back_populates="reservations")
    payments: List["Payment"] = Relationship(back_populates="reservation")
    charges: List["Charge"] = Relationship(back_populates="reservation")

class Payment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    reservation_id: uuid.UUID = Field(foreign_key="reservation.id")
    payment_method_id: Optional[uuid.UUID] = Field(default=None, foreign_key="paymentmethod.id")
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    net_amount: Decimal = Field(default=0, max_digits=10, decimal_places=2)  # Amount after fees
    payment_type: str # deposit, balance, penalty
    non_refundable: bool = Field(default=True)
    beneficiary: str # company, third_party
    percentage_applied: Decimal = Field(max_digits=5, decimal_places=2)
    status: str = Field(default="pending") # paid, pending
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    reservation: Optional[Reservation] = Relationship(back_populates="payments")
    payment_method: Optional["PaymentMethod"] = Relationship(back_populates="payments")

class Charge(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    reservation_id: uuid.UUID = Field(foreign_key="reservation.id")
    type: str # penalty, fee
    description: str
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    beneficiary: str # company, third_party
    paid: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    reservation: Optional[Reservation] = Relationship(back_populates="charges")
