from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.schemas import UserRead

router = APIRouter()

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
