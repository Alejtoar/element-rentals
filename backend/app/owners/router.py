from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db import get_session
from app.owners.schemas import OwnerCreate, OwnerRead, OwnerUpdate, OwnerFinancialRead
from app.owners.service import OwnerService
import uuid

from app.auth.dependencies import get_current_admin_user, get_current_staff_user, get_current_finance_user
from app.users.models import User

router = APIRouter()

@router.get("/whatsapp-link")
def get_owner_whatsapp_link(lang: str = "es", source: Optional[str] = None):
    from app.utils.whatsapp import generate_whatsapp_link
    url = generate_whatsapp_link("owner", lang, source=source)
    return {"url": url}

@router.post("/", response_model=OwnerRead)
def create_owner(
    *, 
    session: Session = Depends(get_session), 
    owner_in: OwnerCreate,
    current_user: User = Depends(get_current_staff_user)
):
    service = OwnerService(session)
    return service.create_owner(owner_in)

@router.get("/", response_model=List[OwnerRead])
def read_owners(
    *, 
    session: Session = Depends(get_session), 
    offset: int = 0, 
    limit: int = 100,
    current_user: User = Depends(get_current_staff_user)
):
    service = OwnerService(session)
    return service.get_owners(offset, limit)

@router.get("/{owner_id}", response_model=OwnerRead)
def read_owner(
    *, 
    session: Session = Depends(get_session), 
    owner_id: uuid.UUID,
    current_user: User = Depends(get_current_staff_user)
):
    service = OwnerService(session)
    return service.get_owner_by_id(owner_id)

@router.get("/{owner_id}/financial", response_model=OwnerFinancialRead)
def read_owner_financial(
    *, 
    session: Session = Depends(get_session), 
    owner_id: uuid.UUID,
    current_user: User = Depends(get_current_finance_user)
):
    """
    Get owner details including sensitive financial information (bank_details).
    
    Security: Only accessible by Finance and Admin roles.
    Used for payout processing and financial reconciliation.
    
    SEC-001: This endpoint was created to restrict bank_details access
    from general staff users while allowing finance team to process payouts.
    """
    service = OwnerService(session)
    owner = service.get_owner_by_id(owner_id)
    # Return the owner with all fields including bank_details
    return owner

@router.patch("/{owner_id}", response_model=OwnerRead)
def update_owner(
    *, 
    session: Session = Depends(get_session), 
    owner_id: uuid.UUID, 
    owner_in: OwnerUpdate,
    current_user: User = Depends(get_current_staff_user)
):
    service = OwnerService(session)
    return service.update_owner(owner_id, owner_in)

@router.delete("/{owner_id}", status_code=204)
def delete_owner(
    *, 
    session: Session = Depends(get_session), 
    owner_id: uuid.UUID,
    current_user: User = Depends(get_current_staff_user)
):
    """
    Delete an owner.
    
    Business Rule: Cannot delete an owner with active properties.
    Returns 400 if owner has properties linked.
    """
    service = OwnerService(session)
    service.delete_owner(owner_id)
    return None
