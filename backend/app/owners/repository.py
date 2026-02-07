from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from app.owners.models import Owner

class OwnerRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, owner_id: UUID) -> Optional[Owner]:
        return self.session.get(Owner, owner_id)

    def get_all(self, offset: int = 0, limit: int = 100) -> List[Owner]:
        statement = select(Owner).offset(offset).limit(limit)
        return self.session.exec(statement).all()

    def create(self, owner: Owner) -> Owner:
        self.session.add(owner)
        self.session.commit()
        self.session.refresh(owner)
        return owner

    def update(self, owner: Owner) -> Owner:
        self.session.add(owner)
        self.session.commit()
        self.session.refresh(owner)
        return owner

    def delete(self, owner: Owner) -> bool:
        self.session.delete(owner)
        self.session.commit()
        return True
