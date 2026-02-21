import uuid
from datetime import datetime, date
from typing import Optional
from sqlmodel import SQLModel


# ─── ExternalCalendar Schemas ────────────────────────────────────────────────

class ExternalCalendarCreate(SQLModel):
    """Payload to register a new external .ics source for a property."""
    name: str  # e.g., "Airbnb", "Booking"
    url: str   # The secret .ics URL from the platform


class ExternalCalendarRead(SQLModel):
    id: uuid.UUID
    property_id: uuid.UUID
    name: str
    url: str
    last_sync: Optional[datetime] = None
    created_at: datetime


# ─── CalendarBlock Schemas ────────────────────────────────────────────────────

class CalendarBlockRead(SQLModel):
    id: uuid.UUID
    property_id: uuid.UUID
    start_date: date
    end_date: date
    source: str
    external_uid: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime


# ─── Sync Result Schema ───────────────────────────────────────────────────────

class SyncResult(SQLModel):
    calendar_id: uuid.UUID
    calendar_name: str
    status: str          # "ok" | "error"
    blocks_deleted: int
    blocks_created: int
    error: Optional[str] = None
