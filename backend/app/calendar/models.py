import uuid
from datetime import datetime, date
from typing import Optional
from sqlmodel import SQLModel, Field


class CalendarBlock(SQLModel, table=True):
    """
    Represents a continuous date range during which a property is unavailable.
    Used to synchronize availability from external iCal sources (Airbnb, Booking, etc.)
    or to block dates manually.

    This model does NOT represent a reservation. It contains no guest or pricing data.
    It exists solely to communicate unavailability to the frontend.
    """
    __tablename__ = "calendarblock"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    property_id: uuid.UUID = Field(foreign_key="property.id", index=True)
    start_date: date
    end_date: date
    # Source: airbnb, booking, owner, manual
    source: str = Field(default="manual")
    # UID from the original iCal event — used for deduplication on replace strategy
    external_uid: Optional[str] = Field(default=None, index=True)
    reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
