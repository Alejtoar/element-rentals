import uuid
from decimal import Decimal
from typing import Optional, List
from sqlmodel import SQLModel

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

# Read
class PropertyImageRead(SQLModel):
    id: uuid.UUID
    url: str
    is_main: bool
    order: int

class PropertyRead(PropertyBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    images: List[PropertyImageRead] = []
