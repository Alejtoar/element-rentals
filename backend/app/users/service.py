from typing import Optional, List
from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.users.repository import UserRepository
from app.users.models import User
from app.users.schemas import UserCreate, UserUpdate
from app.auth.security import get_password_hash, verify_password

class UserService:
    def __init__(self, session: Session):
        self.repository = UserRepository(session)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.repository.get_by_email(email)

    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get a user by their ID"""
        return self.repository.get_by_id(user_id)

    def get_all_users(self, offset: int = 0, limit: int = 100) -> List[User]:
        """List all users (admin only)"""
        return self.repository.get_all(offset, limit)

    def create_user(self, user_create: UserCreate) -> User:
        # Check if user already exists
        existing_user = self.get_user_by_email(user_create.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            full_name=user_create.full_name,
            hashed_password=hashed_password,
            role=user_create.role,
            is_active=user_create.is_active
        )
        return self.repository.create(db_user)

    def update_user(self, user_id: UUID, user_update: UserUpdate) -> User:
        """Update user information (admin only)"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check email uniqueness if email is being updated
        if user_update.email and user_update.email != user.email:
            existing_user = self.get_user_by_email(user_update.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists"
                )
        
        update_data = user_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        
        return self.repository.update(user)

    def update_password(
        self, 
        user_id: UUID, 
        new_password: str, 
        old_password: Optional[str] = None,
        is_admin: bool = False
    ) -> User:
        """
        Update user password.
        
        Args:
            user_id: ID of the user to update
            new_password: The new password to set
            old_password: Current password (required for self-update)
            is_admin: Whether the requester is an admin (bypasses old_password check)
        """
        user = self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # If not admin, verify old password
        if not is_admin:
            if not old_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Old password is required"
                )
            if not verify_password(old_password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect password"
                )
        
        # Update password
        user.hashed_password = get_password_hash(new_password)
        return self.repository.update(user)

    def create_admin_if_not_exists(self):
        from app.config import settings
        admin_email = settings.FIRST_ADMIN_EMAIL
        existing_user = self.get_user_by_email(admin_email)
        if not existing_user:
            print(f"Seeding admin user: {admin_email}")
            admin_create = UserCreate(
                email=admin_email,
                password=settings.FIRST_ADMIN_PASSWORD,
                full_name="Admin User",
                role="admin",
                is_active=True
            )
            self.create_user(admin_create)
