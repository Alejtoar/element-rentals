import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class ManagementContract(SQLModel, table=True):
    __tablename__ = "management_contract"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="owner.id")
    property_id: uuid.UUID = Field(foreign_key="property.id")
    commission_rate: Decimal = Field(default=0.20, max_digits=5, decimal_places=2)
    exclusive: bool = Field(default=True)
    start_date: date
    end_date: Optional[date] = None
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    owner: Optional["Owner"] = Relationship(back_populates="contracts")
    property: Optional["Property"] = Relationship(back_populates="contracts")
