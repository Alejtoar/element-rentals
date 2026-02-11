from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from uuid import UUID
from sqlmodel import SQLModel

class ManagementContractBase(SQLModel):
    owner_id: UUID
    property_id: UUID
    commission_rate: Optional[Decimal] = Decimal("0.20")
    exclusive: Optional[bool] = True
    start_date: date
    end_date: Optional[date] = None
    active: Optional[bool] = True

class ManagementContractCreate(ManagementContractBase):
    pass

class ManagementContractUpdate(SQLModel):
    commission_rate: Optional[Decimal] = None
    exclusive: Optional[bool] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    active: Optional[bool] = None

class ManagementContractRead(ManagementContractBase):
    id: UUID
    created_at: datetime
