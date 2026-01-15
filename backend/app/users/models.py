import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = Field(default="staff")  # admin, staff, finance
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
