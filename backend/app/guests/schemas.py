import uuid
from typing import Optional
from sqlmodel import SQLModel

# Shared
class GuestBase(SQLModel):
    full_name: str
    email: Optional[str] = None
    phone: str

# Create
class GuestCreate(GuestBase):
    pass

# Update
class GuestUpdate(SQLModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

# Read
class GuestRead(GuestBase):
    id: uuid.UUID
