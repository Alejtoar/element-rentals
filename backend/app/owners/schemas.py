import uuid
from typing import Optional, List
from sqlmodel import SQLModel

# Shared
class OwnerBase(SQLModel):
    full_name: str
    email: str
    phone: str

# Create
class OwnerCreate(OwnerBase):
    pass

# Update
class OwnerUpdate(SQLModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

# Read
class OwnerRead(OwnerBase):
    id: uuid.UUID
    # potentially list properties
