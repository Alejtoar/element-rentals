from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session
from app.owners.models import Owner
from app.owners.repository import OwnerRepository
from app.owners.schemas import OwnerCreate, OwnerUpdate

class OwnerService:
    def __init__(self, session: Session):
        self.repository = OwnerRepository(session)

    def get_owner_by_id(self, owner_id: UUID) -> Owner:
        owner = self.repository.get_by_id(owner_id)
        if not owner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Owner not found"
            )
        return owner

    def get_owners(self, offset: int = 0, limit: int = 100) -> List[Owner]:
        return self.repository.get_all(offset, limit)

    def create_owner(self, owner_in: OwnerCreate) -> Owner:
        owner = Owner.from_orm(owner_in)
        return self.repository.create(owner)

    def update_owner(self, owner_id: UUID, owner_in: OwnerUpdate) -> Owner:
        owner = self.get_owner_by_id(owner_id)
        update_data = owner_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(owner, key, value)
        return self.repository.update(owner)
