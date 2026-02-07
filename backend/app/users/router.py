from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.db import get_session
from app.auth.dependencies import get_current_user, get_current_admin_user
from app.users.models import User
from app.users.schemas import UserRead, UserCreate, UserUpdate, UserPasswordUpdate
from app.users.service import UserService

router = APIRouter()

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.get("/", response_model=List[UserRead])
def list_users(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """List all users (admin only)"""
    service = UserService(session)
    return service.get_all_users(offset=skip, limit=limit)

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new user (admin only)"""
    service = UserService(session)
    return service.create_user(user_in)

@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific user by ID (admin only)"""
    service = UserService(session)
    user = service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: UUID,
    user_in: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Update user information (admin only)"""
    service = UserService(session)
    return service.update_user(user_id, user_in)

@router.post("/{user_id}/password", response_model=UserRead)
def update_user_password_admin(
    user_id: UUID,
    password_data: UserPasswordUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Admin password reset: Admin can update any user's password without old password.
    """
    service = UserService(session)
    return service.update_password(
        user_id=user_id,
        new_password=password_data.new_password,
        is_admin=True
    )

@router.post("/me/password", response_model=UserRead)
def update_own_password(
    password_data: UserPasswordUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Self password update: User must provide old_password to change their own password.
    """
    service = UserService(session)
    return service.update_password(
        user_id=current_user.id,
        new_password=password_data.new_password,
        old_password=password_data.old_password,
        is_admin=False
    )
