from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db import get_session
from app.owners.schemas import OwnerCreate, OwnerRead, OwnerUpdate
from app.owners.service import OwnerService
import uuid

from app.auth.dependencies import get_current_admin_user
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
    current_user: User = Depends(get_current_admin_user)
):
    service = OwnerService(session)
    return service.create_owner(owner_in)

@router.get("/", response_model=List[OwnerRead])
def read_owners(
    *, 
    session: Session = Depends(get_session), 
    offset: int = 0, 
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user)
):
    service = OwnerService(session)
    return service.get_owners(offset, limit)

@router.get("/{owner_id}", response_model=OwnerRead)
def read_owner(
    *, 
    session: Session = Depends(get_session), 
    owner_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user)
):
    service = OwnerService(session)
    return service.get_owner_by_id(owner_id)

@router.patch("/{owner_id}", response_model=OwnerRead)
def update_owner(
    *, 
    session: Session = Depends(get_session), 
    owner_id: uuid.UUID, 
    owner_in: OwnerUpdate,
    current_user: User = Depends(get_current_admin_user)
):
    service = OwnerService(session)
    return service.update_owner(owner_id, owner_in)
