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

    def delete_owner(self, owner_id: UUID) -> bool:
        """
        Delete an owner.
        
        Business Rule: Cannot delete an owner with active properties.
        
        Args:
            owner_id: UUID of the owner to delete
            
        Returns:
            bool: True if deletion was successful
            
        Raises:
            HTTPException: 404 if owner not found, 400 if owner has active properties
        """
        owner = self.get_owner_by_id(owner_id)
        
        # Check if owner has any properties
        if owner.properties and len(owner.properties) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete owner with {len(owner.properties)} active properties. Please reassign or delete properties first."
            )
        
        return self.repository.delete(owner)
