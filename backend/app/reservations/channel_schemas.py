import uuid
from typing import Optional
from sqlmodel import SQLModel

# Shared
class ChannelBase(SQLModel):
    name: str  # Airbnb, Booking, Manual, Direct
    external: bool = True

# Create
class ChannelCreate(ChannelBase):
    pass

# Update
class ChannelUpdate(SQLModel):
    name: Optional[str] = None
    external: Optional[bool] = None

# Read
class ChannelRead(ChannelBase):
    id: uuid.UUID
