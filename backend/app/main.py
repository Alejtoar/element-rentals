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
from app.users.service import UserService
from app.db import engine
from sqlmodel import Session

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS - Allow all for now in dev
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for uploads
# We assume "uploads" directory is in the current working directory
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.on_event("startup")
def on_startup():
    init_db()
    with Session(engine) as session:
        user_service = UserService(session)
        user_service.create_admin_if_not_exists()

app.include_router(properties_router, prefix="/properties", tags=["properties"])
app.include_router(owners_router, prefix="/owners", tags=["owners"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(leads_router, prefix="/leads", tags=["leads"])

@app.get("/")
def root():
    return {"message": "Welcome to Elemnt Rentals API", "env": settings.ENV}

@app.get("/health")
def health_check():
    return {"status": "ok"}
