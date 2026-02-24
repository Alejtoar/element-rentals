import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# Forward references for relationships
from app.owners.models import Owner

class Property(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="owner.id")
    name: str
    description: str = Field(default="")
    slug: str = Field(index=True, unique=True)
    nightly_price: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    address: str
    city: str
    country: str
    max_guests: int
    active: bool = Field(default=False)
    featured: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # iCal Export Token (to share our calendar with Airbnb/Booking)
    # This acts as a secret token in the URL: /api/v1/properties/{id}/ical?token={ical_secret}
    ical_secret: uuid.UUID = Field(default_factory=uuid.uuid4)
    
    # Relationships
    owner: Optional[Owner] = Relationship(back_populates="properties")
    images: List["PropertyImage"] = Relationship(back_populates="property")
    reservations: List["Reservation"] = Relationship(back_populates="property")
    expenses: List["Expense"] = Relationship(back_populates="property")
    contracts: List["ManagementContract"] = Relationship(back_populates="property")
    external_calendars: List["ExternalCalendar"] = Relationship(back_populates="property")

class ExternalCalendar(SQLModel, table=True):
    __tablename__ = "external_calendar"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    property_id: uuid.UUID = Field(foreign_key="property.id")
    name: str  # e.g., "Airbnb", "Booking"
    url: str   # The .ics URL from the platform
    last_sync: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    property: Optional[Property] = Relationship(back_populates="external_calendars")

class PropertyImage(SQLModel, table=True):
    __tablename__ = "property_image"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    property_id: uuid.UUID = Field(foreign_key="property.id")
    url: str
    is_main: bool = Field(default=False)
    order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    property: Optional[Property] = Relationship(back_populates="images")
