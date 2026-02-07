from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from app.guests.models import Guest

class GuestRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, guest_id: UUID) -> Optional[Guest]:
        return self.session.get(Guest, guest_id)

    def get_all(self, offset: int = 0, limit: int = 100) -> List[Guest]:
        statement = select(Guest).offset(offset).limit(limit)
        return self.session.exec(statement).all()

    def create(self, guest: Guest) -> Guest:
        self.session.add(guest)
        self.session.commit()
        self.session.refresh(guest)
        return guest

    def update(self, guest: Guest) -> Guest:
        self.session.add(guest)
        self.session.commit()
        self.session.refresh(guest)
        return guest

    def delete(self, guest: Guest) -> None:
        self.session.delete(guest)
        self.session.commit()

