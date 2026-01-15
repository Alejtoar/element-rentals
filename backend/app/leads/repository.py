from typing import List, Optional, Union
from uuid import UUID
from sqlmodel import Session, select
from app.leads.models import OwnerLead, GuestLead

class LeadRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_owner_lead(self, lead: OwnerLead) -> OwnerLead:
        self.session.add(lead)
        self.session.commit()
        self.session.refresh(lead)
        return lead

    def create_guest_lead(self, lead: GuestLead) -> GuestLead:
        self.session.add(lead)
        self.session.commit()
        self.session.refresh(lead)
        return lead

    def get_owner_leads(self, offset: int = 0, limit: int = 100) -> List[OwnerLead]:
        statement = select(OwnerLead).offset(offset).limit(limit).order_by(OwnerLead.created_at.desc())
        return self.session.exec(statement).all()

    def get_guest_leads(self, offset: int = 0, limit: int = 100) -> List[GuestLead]:
        statement = select(GuestLead).offset(offset).limit(limit).order_by(GuestLead.created_at.desc())
        return self.session.exec(statement).all()
