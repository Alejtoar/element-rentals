import uuid
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Guest(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    full_name: str
    email: Optional[str] = Field(default=None, index=True)
    phone: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    reservations: List["Reservation"] = Relationship(back_populates="guest")
