from typing import Optional
from sqlmodel import Session
from app.users.repository import UserRepository
from app.users.models import User
from app.users.schemas import UserCreate
from app.auth.security import get_password_hash

class UserService:
    def __init__(self, session: Session):
        self.repository = UserRepository(session)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.repository.get_by_email(email)

    def create_user(self, user_create: UserCreate) -> User:
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            hashed_password=hashed_password,
            role=user_create.role,
            is_active=user_create.is_active
        )
        return self.repository.create(db_user)

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
