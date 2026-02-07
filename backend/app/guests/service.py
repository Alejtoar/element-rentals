from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session
from app.guests.models import Guest
from app.guests.repository import GuestRepository
from app.guests.schemas import GuestCreate, GuestUpdate

class GuestService:
    def __init__(self, session: Session):
        self.repository = GuestRepository(session)

    def get_guest_by_id(self, guest_id: UUID) -> Guest:
        guest = self.repository.get_by_id(guest_id)
        if not guest:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Guest not found"
            )
        return guest

    def get_guests(self, offset: int = 0, limit: int = 100) -> List[Guest]:
        return self.repository.get_all(offset, limit)

    def create_guest(self, guest_in: GuestCreate) -> Guest:
        guest = Guest(**guest_in.dict())
        return self.repository.create(guest)

    def update_guest(self, guest_id: UUID, guest_in: GuestUpdate) -> Guest:
        guest = self.get_guest_by_id(guest_id)
        update_data = guest_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(guest, key, value)
        return self.repository.update(guest)

    def delete_guest(self, guest_id: UUID) -> None:
        guest = self.get_guest_by_id(guest_id)
        self.repository.delete(guest)
