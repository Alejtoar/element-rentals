from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File
from sqlmodel import Session
from app.db import get_session
from app.properties.schemas import PropertyCreate, PropertyRead, PropertyUpdate
from app.properties.service import PropertyService
import uuid

from app.auth.dependencies import get_current_admin_user
from app.users.models import User

router = APIRouter()

@router.post("/", response_model=PropertyRead)
def create_property(
    *, 
    session: Session = Depends(get_session), 
    property_in: PropertyCreate,
    current_user: User = Depends(get_current_admin_user)
):
    service = PropertyService(session)
    return service.create_property(property_in)

@router.get("/", response_model=List[PropertyRead])
def read_properties(
    *,
    session: Session = Depends(get_session),
    city: Optional[str] = None,
    max_guests: Optional[int] = None,
    active: Optional[bool] = None,
    offset: int = 0,
    limit: int = 100,
):
    service = PropertyService(session)
    return service.get_properties(city, max_guests, active, offset, limit)

@router.get("/{property_id}", response_model=PropertyRead)
def read_property(*, session: Session = Depends(get_session), property_id: uuid.UUID):
    service = PropertyService(session)
    return service.get_property_by_id(property_id)

@router.patch("/{property_id}", response_model=PropertyRead)
def update_property(
    *, 
    session: Session = Depends(get_session), 
    property_id: uuid.UUID, 
    property_in: PropertyUpdate,
    current_user: User = Depends(get_current_admin_user)
):
    service = PropertyService(session)
    return service.update_property(property_id, property_in)

@router.get("/{property_id}/whatsapp-link")
def get_property_whatsapp_link(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    lang: str = "es",
    source: Optional[str] = None
):
    service = PropertyService(session)
    url = service.get_whatsapp_link(property_id, lang, source)
    return {"url": url}

@router.post("/{property_id}/images", response_model=PropertyRead)
def upload_property_image(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    file: UploadFile = File(...),
    is_main: bool = False,
    current_user: User = Depends(get_current_admin_user)
):
    service = PropertyService(session)
    return service.upload_image(property_id, file, is_main)
