from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Elemnt Rentals API"
    ENV: str = "dev"
    
    # Database
    DATABASE_URL: Optional[str] 
    # Security
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    BACKEND_CORS_ORIGINS: list[str] = []
    
    # WhatsApp
    WHATSAPP_PHONE: str
    NOTIFICATIONS_WEBHOOK_URL: Optional[str] = None
    
    # Seeding
    FIRST_ADMIN_EMAIL: str 
    FIRST_ADMIN_PASSWORD: str 
    AUTO_SEED_ADMIN: bool = True

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
