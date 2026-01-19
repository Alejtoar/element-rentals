from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Lead(SQLModel):
    name: str
    phone: str
    message: Optional[str] = None
    source: str = Field(default="website") # website, whatsapp, referral
    ip_address: Optional[str] = None
    user_agent: Optional[str] = Field(default=None, max_length=512)
    referer: Optional[str] = Field(default=None, max_length=1024)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OwnerLead(Lead, table=True):
    __tablename__ = "owner_lead"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    location: str

class GuestLead(Lead, table=True):
    __tablename__ = "guest_lead"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    property_id: Optional[UUID] = Field(default=None, foreign_key="property.id")
    desired_dates: Optional[str] = None
