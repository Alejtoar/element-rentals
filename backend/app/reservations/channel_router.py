from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from app.db import get_session
from app.auth.dependencies import get_current_staff_user
from app.users.models import User
from app.reservations.channel_schemas import ChannelCreate, ChannelRead, ChannelUpdate
from app.reservations.channel_service import ChannelService

router = APIRouter()

@router.post("/", response_model=ChannelRead, status_code=status.HTTP_201_CREATED)
def create_channel(
    channel_in: ChannelCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Create a new booking channel (staff/admin only)"""
    service = ChannelService(session)
    return service.create_channel(channel_in)

@router.get("/", response_model=List[ChannelRead])
def list_channels(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """List all booking channels (staff/admin only)"""
    service = ChannelService(session)
    return service.get_channels(offset=skip, limit=limit)

@router.get("/{channel_id}", response_model=ChannelRead)
def get_channel(
    channel_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Get a specific channel by ID (staff/admin only)"""
    service = ChannelService(session)
    return service.get_channel_by_id(channel_id)

@router.patch("/{channel_id}", response_model=ChannelRead)
def update_channel(
    channel_id: UUID,
    channel_in: ChannelUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Update channel information (staff/admin only)"""
    service = ChannelService(session)
    return service.update_channel(channel_id, channel_in)

@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_channel(
    channel_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Delete a channel (staff/admin only)"""
    service = ChannelService(session)
    service.delete_channel(channel_id)
    return None
