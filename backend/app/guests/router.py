from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.db import get_session
from app.auth.dependencies import get_current_staff_user
from app.users.models import User
from app.guests.schemas import GuestCreate, GuestRead, GuestUpdate
from app.guests.service import GuestService

router = APIRouter()

@router.post("/", response_model=GuestRead, status_code=status.HTTP_201_CREATED)
def create_guest(
    guest_in: GuestCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Create a new guest (staff/admin only)"""
    service = GuestService(session)
    return service.create_guest(guest_in)

@router.get("/", response_model=List[GuestRead])
def list_guests(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """List all guests (staff/admin only)"""
    service = GuestService(session)
    return service.get_guests(offset=skip, limit=limit)

@router.get("/{guest_id}", response_model=GuestRead)
def get_guest(
    guest_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Get a specific guest by ID (staff/admin only)"""
    service = GuestService(session)
    return service.get_guest_by_id(guest_id)

@router.patch("/{guest_id}", response_model=GuestRead)
def update_guest(
    guest_id: UUID,
    guest_in: GuestUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Update guest information (staff/admin only)"""
    service = GuestService(session)
    return service.update_guest(guest_id, guest_in)

@router.delete("/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guest(
    guest_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Delete a guest (staff/admin only)"""
    service = GuestService(session)
    service.delete_guest(guest_id)
    return None
