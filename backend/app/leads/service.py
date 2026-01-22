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
            ip_address=self._sanitize_ip(ip_address),
            user_agent=self._sanitize_metadata(user_agent, 512),
            referer=self._sanitize_metadata(referer, 1024)
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
            ip_address=self._sanitize_ip(ip_address),
            user_agent=self._sanitize_metadata(user_agent, 512),
            referer=self._sanitize_metadata(referer, 1024)
        )
        created_lead = self.repository.create_guest_lead(lead)
        self._notify_new_lead("Guest", created_lead)
        return created_lead

    def _sanitize_metadata(self, value: Optional[str], max_length: int) -> Optional[str]:
        if value is None:
            return None
        import re
        # Remove HTML tags to prevent basic XSS
        sanitized = re.sub(r'<[^>]*?>', '', value)
        # Remove null bytes and other control characters
        sanitized = "".join(char for char in sanitized if ord(char) >= 32 or char in "\n\r\t")
        # Truncate to max length
        return sanitized[:max_length].strip()

    def _sanitize_ip(self, ip: Optional[str]) -> Optional[str]:
        if ip is None:
            return None
        # Basic regex to allow only valid IP characters (dots, colons, numbers)
        # Prevents headers injection if the IP comes from a manipulated header
        import re
        sanitized = re.sub(r'[^0-9a-fA-F.:%]', '', ip)
        return sanitized[:45] # Max length for IPv6 with scope ID

    def get_owner_leads(self, offset: int = 0, limit: int = 100) -> List[OwnerLead]:
        return self.repository.get_owner_leads(offset, limit)

    def get_guest_leads(self, offset: int = 0, limit: int = 100) -> List[GuestLead]:
        return self.repository.get_guest_leads(offset, limit)

    def _notify_new_lead(self, lead_type: str, lead: Union[OwnerLead, GuestLead]):
        from app.notifications.service import WebhookNotifier
        notifier = WebhookNotifier()
        
        import json
        lead_data = json.loads(lead.json())
        
        # If it's a guest lead with a property_id, try to get the property name
        if lead_type.lower() == "guest" and getattr(lead, "property_id", None):
            try:
                from app.properties.repository import PropertyRepository
                repo = PropertyRepository(self.repository.session)
                prop = repo.get_by_id(lead.property_id)
                if prop:
                    lead_data["property_name"] = prop.name
            except Exception as e:
                logger.error(f"Failed to fetch property name for lead notification: {e}")

        notifier.notify_lead(lead_type.lower(), lead_data)
        logger.info(f"NOTIFICATION SENT: New {lead_type} lead captured from {lead.name}")
