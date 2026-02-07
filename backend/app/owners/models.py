import uuid
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Owner(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    full_name: str
    email: str = Field(index=True)
    phone: str
    bank_details: Optional[str] = Field(default=None)  # Bank account info for payouts (Phase 2)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    properties: List["Property"] = Relationship(back_populates="owner")

