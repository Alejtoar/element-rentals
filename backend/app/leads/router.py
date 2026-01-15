from typing import List, Optional
from fastapi import APIRouter, Depends, Request
from sqlmodel import Session
from app.db import get_session
from app.leads.schemas import OwnerLeadCreate, OwnerLeadRead, GuestLeadCreate, GuestLeadRead
from app.leads.service import LeadService
from app.auth.dependencies import get_current_admin_user
from app.users.models import User

router = APIRouter()

@router.post("/owner", response_model=OwnerLeadRead)
def create_owner_lead(
    *,
    session: Session = Depends(get_session),
    lead_in: OwnerLeadCreate,
    request: Request
):
    service = LeadService(session)
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    referer = request.headers.get("referer")
    
    return service.create_owner_lead(
        lead_in, 
        ip_address=ip_address, 
        user_agent=user_agent, 
        referer=referer
    )

@router.post("/guest", response_model=GuestLeadRead)
def create_guest_lead(
    *,
    session: Session = Depends(get_session),
    lead_in: GuestLeadCreate,
    request: Request
):
    service = LeadService(session)
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    referer = request.headers.get("referer")
    
    return service.create_guest_lead(
        lead_in, 
        ip_address=ip_address, 
        user_agent=user_agent, 
        referer=referer
    )

@router.get("/owner", response_model=List[OwnerLeadRead])
def get_owner_leads(
    *,
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user)
):
    service = LeadService(session)
    return service.get_owner_leads(offset, limit)

@router.get("/guest", response_model=List[GuestLeadRead])
def get_guest_leads(
    *,
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user)
):
    service = LeadService(session)
    return service.get_guest_leads(offset, limit)
