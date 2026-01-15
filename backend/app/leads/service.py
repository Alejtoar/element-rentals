from typing import List, Optional, Union
from sqlmodel import Session
from app.leads.models import OwnerLead, GuestLead
from app.leads.repository import LeadRepository
from app.leads.schemas import OwnerLeadCreate, GuestLeadCreate
import logging

logger = logging.getLogger(__name__)

class LeadService:
    def __init__(self, session: Session):
        self.repository = LeadRepository(session)

    def create_owner_lead(
        self, 
        lead_in: OwnerLeadCreate, 
        ip_address: Optional[str] = None, 
        user_agent: Optional[str] = None, 
        referer: Optional[str] = None
    ) -> OwnerLead:
        lead = OwnerLead(
            **lead_in.dict(),
            ip_address=ip_address,
            user_agent=user_agent,
            referer=referer
        )
        created_lead = self.repository.create_owner_lead(lead)
        self._notify_new_lead("Owner", created_lead)
        return created_lead

    def create_guest_lead(
        self, 
        lead_in: GuestLeadCreate, 
        ip_address: Optional[str] = None, 
        user_agent: Optional[str] = None, 
        referer: Optional[str] = None
    ) -> GuestLead:
        lead = GuestLead(
            **lead_in.dict(),
            ip_address=ip_address,
            user_agent=user_agent,
            referer=referer
        )
        created_lead = self.repository.create_guest_lead(lead)
        self._notify_new_lead("Guest", created_lead)
        return created_lead

    def get_owner_leads(self, offset: int = 0, limit: int = 100) -> List[OwnerLead]:
        return self.repository.get_owner_leads(offset, limit)

    def get_guest_leads(self, offset: int = 0, limit: int = 100) -> List[GuestLead]:
        return self.repository.get_guest_leads(offset, limit)

    def _notify_new_lead(self, lead_type: str, lead: Union[OwnerLead, GuestLead]):
        # Mocking notification trigger as per MVP scope
        logger.info(f"NOTIFICATION: New {lead_type} lead captured from {lead.name} ({lead.phone}) via {lead.source}")
