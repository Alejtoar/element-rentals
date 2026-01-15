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
    nightly_price: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    address: str
    city: str
    country: str
    max_guests: int
    active: bool = Field(default=False)
    featured: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    owner: Optional[Owner] = Relationship(back_populates="properties")
    images: List["PropertyImage"] = Relationship(back_populates="property")
    reservations: List["Reservation"] = Relationship(back_populates="property")

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
