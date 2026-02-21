import uuid
from datetime import date
from decimal import Decimal
from typing import Optional, List, Literal
from sqlmodel import SQLModel
from pydantic import computed_field

# Shared Base Model
class PropertyBase(SQLModel):
    name: str
    nightly_price: Decimal
    address: str
    city: str
    country: str
    max_guests: int
    active: bool = False
    featured: bool = False

# Create
class PropertyCreate(PropertyBase):
    owner_id: uuid.UUID

# Update
class PropertyUpdate(SQLModel):
    name: Optional[str] = None
    nightly_price: Optional[Decimal] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    max_guests: Optional[int] = None
    active: Optional[bool] = None
    featured: Optional[bool] = None
    owner_id: Optional[uuid.UUID] = None
    slug: Optional[str] = None

# Read
class PropertyImageRead(SQLModel):
    id: uuid.UUID
    url: str
    is_main: bool
    order: int

class PropertyRead(PropertyBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    slug: str
    ical_secret: uuid.UUID
    images: List[PropertyImageRead] = []

    @computed_field
    @property
    def main_image_url(self) -> Optional[str]:
        if not self.images:
            return None
        main = next((img for img in self.images if img.is_main), None)
        return main.url if main else self.images[0].url

class PropertyPublicRead(PropertyBase):
    """
    Schema for public-facing property data. 
    EXCLUDES ical_secret to prevent data leakage and subscription hijacking.
    """
    id: uuid.UUID
    slug: str
    images: List[PropertyImageRead] = []

    @computed_field
    @property
    def main_image_url(self) -> Optional[str]:
        if not self.images:
            return None
        main = next((img for img in self.images if img.is_main), None)
        return main.url if main else self.images[0].url


# ─── Availability Schemas ─────────────────────────────────────────────────────

class AvailabilityBlockRead(SQLModel):
    """
    A single blocked date range for a property.
    Can originate from a confirmed Reservation or an imported CalendarBlock.
    """
    start_date: date
    end_date: date
    # Discriminator: tells the frontend the origin of the block
    type: Literal["reservation", "calendar_block"]
    source: Optional[str] = None  # "airbnb", "booking", "manual", etc.
    reason: Optional[str] = None  # Summary text from iCal, or reservation type


class AvailabilityResponse(SQLModel):
    """
    Full availability payload for a property's calendar widget.
    Aggregates blocked ranges from all sources.
    """
    property_id: uuid.UUID
    blocked: List[AvailabilityBlockRead]
