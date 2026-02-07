from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class OwnerLeadCreate(BaseModel):
    name: str
    phone: str
    location: str
    message: Optional[str] = None
    source: str = "website"
    # UTM tracking fields
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None

class OwnerLeadRead(OwnerLeadCreate):
    id: UUID
    created_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referer: Optional[str] = None

class GuestLeadCreate(BaseModel):
    property_id: Optional[UUID] = None
    name: str
    phone: str
    desired_dates: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"
    # UTM tracking fields
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None

class GuestLeadRead(GuestLeadCreate):
    id: UUID
    created_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referer: Optional[str] = None
