import logging
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
import passlib.handlers.bcrypt

# Fix for passlib + bcrypt 4.0.1+ and Python 3.13
# This avoids the "ValueError: password cannot be longer than 72 bytes"
# We disable the internal workarounds/audits because they are incompatible 
# with modern bcrypt/Python versions and aren't needed for our environment.
if hasattr(passlib.handlers.bcrypt, "_BcryptCommon"):
    # Directly setting to a dummy function that returns True to skip audits and satisfy return type check
    passlib.handlers.bcrypt._BcryptCommon._finalize_backend_mixin = classmethod(lambda cls, name, dryrun: True)

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
