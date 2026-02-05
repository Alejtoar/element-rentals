from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.db import init_db
from app.users.models import User
from app.owners.models import Owner
from app.properties.models import Property, PropertyImage
from app.leads.models import OwnerLead, GuestLead
from app.guests.models import Guest
from app.reservations.models import Reservation, Payment, Charge, Channel

from app.properties.router import router as properties_router
from app.owners.router import router as owners_router
from app.auth.router import router as auth_router
from app.leads.router import router as leads_router
from app.reservations.router import router as reservations_router, payment_router
from app.users.router import router as users_router
from app.users.service import UserService
from app.db import engine
from sqlmodel import Session

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    strict_slashes=False
)

if settings.ENV != "dev":
    @app.middleware("http")
    async def force_https_middleware(request, call_next):
        # Force HTTPS scheme for all requests behind the tunnel in production/staging
        request.scope["scheme"] = "https"
        response = await call_next(request)
        return response

# Standard CORS configuration
origins = []
if settings.BACKEND_CORS_ORIGINS:
    for origin in settings.BACKEND_CORS_ORIGINS:
        origins.append(str(origin))
# Ensure localhost is always allowed in dev
if settings.ENV == "dev" and "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for uploads
# Serve uploads directory at /uploads URL prefix
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
def on_startup():
    init_db()
    if settings.AUTO_SEED_ADMIN:
        with Session(engine) as session:
            user_service = UserService(session)
            user_service.create_admin_if_not_exists()

app.include_router(properties_router, prefix=f"{settings.API_V1_STR}/properties", tags=["properties"])
app.include_router(owners_router, prefix=f"{settings.API_V1_STR}/owners", tags=["owners"])
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(leads_router, prefix=f"{settings.API_V1_STR}/leads", tags=["leads"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(reservations_router, prefix=settings.API_V1_STR)
app.include_router(payment_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to Elemnt Rentals API", "env": settings.ENV}

@app.get("/health")
def health_check():
    return {"status": "ok"}
