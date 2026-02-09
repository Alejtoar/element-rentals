import uuid
from typing import Optional, List
from sqlmodel import SQLModel

# Shared base (without sensitive data)
class OwnerBase(SQLModel):
    full_name: str
    email: str
    phone: str

# Create (includes bank_details for initial setup)
class OwnerCreate(OwnerBase):
    bank_details: Optional[str] = None

# Update
class OwnerUpdate(SQLModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bank_details: Optional[str] = None

# Read (Standard - NO bank_details for staff users)
class OwnerRead(OwnerBase):
    id: uuid.UUID
    # bank_details intentionally excluded for security (SEC-001)

# Read with Financial Data (Finance/Admin only)
class OwnerFinancialRead(OwnerRead):
    """
    Extended owner schema including sensitive financial information.
    Only accessible by Finance and Admin roles.
    """
    bank_details: Optional[str] = None
