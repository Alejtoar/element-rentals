from datetime import date, datetime
from typing import List, Optional, Dict, Tuple
from fastapi import APIRouter, Depends, UploadFile, File, Response, BackgroundTasks, HTTPException
from sqlmodel import Session, select
from app.db import get_session
from app.properties.schemas import PropertyCreate, PropertyRead, PropertyPublicRead, PropertyUpdate, AvailabilityResponse
from app.properties.service import PropertyService
from app.properties.ical_service import ICalService, ICalImportService
from app.calendar.schemas import ExternalCalendarCreate, ExternalCalendarRead, SyncResult, CalendarBlockRead
from app.calendar.models import CalendarBlock
from app.calendar.service import ExternalCalendarService
import uuid
import logging

from app.auth.dependencies import get_current_admin_user, get_current_staff_user
from app.users.models import User

logger = logging.getLogger(__name__)

# ─── Rate Limiter (SEC-021-01) ────────────────────────────────────────────────
# In-memory cooldown store: key = (user_id, property_id), value = last_sync_time
# Limits each user to 1 sync per property per SYNC_COOLDOWN_SECONDS.
# Note: resets on server restart. For multi-process/Swarm deployments,
# replace with a Redis-backed slowapi limiter.
_sync_last_called: Dict[Tuple[str, str], datetime] = {}
SYNC_COOLDOWN_SECONDS = 30

router = APIRouter()


# ─── iCal Export (Public, token-protected) ───────────────────────────────────

@router.get("/{property_id}/ical", response_class=Response)
def export_property_ical(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    token: uuid.UUID
):
    """
    Export property availability in iCal format (RFC 5545).
    Accessible publicly via the unique `ical_secret` token.
    Share this URL with Airbnb/Booking so they can import Elemnt's calendar.
    """
    service = ICalService()
    ical_content = service.generate_property_ical(property_id, token, session)

    return Response(
        content=ical_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename=property_{property_id}.ics"
        }
    )


# ─── External Calendar CRUD (Admin/Staff) ────────────────────────────────────

@router.get(
    "/{property_id}/external-calendars",
    response_model=List[ExternalCalendarRead],
    tags=["ical"],
)
def list_external_calendars(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    current_user: User = Depends(get_current_staff_user),
):
    """List all external iCal source URLs registered for a property."""
    service = ExternalCalendarService(session)
    return service.list_calendars(property_id)


@router.post(
    "/{property_id}/external-calendars",
    response_model=ExternalCalendarRead,
    status_code=201,
    tags=["ical"],
)
def add_external_calendar(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    calendar_in: ExternalCalendarCreate,
    current_user: User = Depends(get_current_staff_user),
):
    """
    Register a new external iCal source for a property.
    Use this to add an Airbnb or Booking.com calendar URL.
    """
    service = ExternalCalendarService(session)
    return service.add_calendar(property_id, calendar_in)


@router.delete(
    "/{property_id}/external-calendars/{calendar_id}",
    status_code=204,
    tags=["ical"],
)
def delete_external_calendar(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    calendar_id: uuid.UUID,
    current_user: User = Depends(get_current_staff_user),
):
    """Remove an external iCal source link. Does not delete already-synced CalendarBlocks."""
    service = ExternalCalendarService(session)
    service.delete_calendar(property_id, calendar_id)
    return None


# ─── Manual Sync Trigger ─────────────────────────────────────────────────────

@router.post(
    "/{property_id}/sync",
    status_code=202,
    tags=["ical"],
)
def sync_property_calendars(
    *,
    background_tasks: BackgroundTasks,
    property_id: uuid.UUID,
    current_user: User = Depends(get_current_staff_user),
):
    """
    Triggers a background synchronization for all external iCal sources.
    Returns 202 Accepted immediately.

    Rate-limited: 1 request per property per user every 30 seconds.
    Prevents background thread exhaustion from rapid repeated calls.
    """
    from app.db import engine
    from sqlmodel import Session

    # ── Rate limit check (SEC-021-01) ────────────────────────────────────────
    rate_key = (str(current_user.id), str(property_id))
    now = datetime.utcnow()
    last_called = _sync_last_called.get(rate_key)
    if last_called is not None:
        elapsed = (now - last_called).total_seconds()
        if elapsed < SYNC_COOLDOWN_SECONDS:
            remaining = int(SYNC_COOLDOWN_SECONDS - elapsed)
            logger.warning(
                "Rate limit hit on /sync — user=%s property=%s remaining=%ds",
                current_user.id, property_id, remaining
            )
            raise HTTPException(
                status_code=429,
                detail=f"Sync rate limit exceeded. Try again in {remaining} seconds.",
                headers={"Retry-After": str(remaining)},
            )
    _sync_last_called[rate_key] = now
    # ─────────────────────────────────────────────────────────────────────────

    def do_sync():
        with Session(engine) as session:
            import_service = ICalImportService(session)
            import_service.sync_property(property_id)

    background_tasks.add_task(do_sync)
    return {"message": "Synchronization started in background"}


# ─── CalendarBlocks Read (Staff) ─────────────────────────────────────────────

@router.get(
    "/{property_id}/calendar-blocks",
    response_model=List[CalendarBlockRead],
    tags=["ical"],
)
def list_calendar_blocks(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    current_user: User = Depends(get_current_staff_user),
):
    """
    List all CalendarBlock entries for a property (admin use).
    Shows all blocked date ranges regardless of source.
    """
    stmt = select(CalendarBlock).where(CalendarBlock.property_id == property_id)
    return session.exec(stmt).all()


# ─── Properties CRUD ─────────────────────────────────────────────────────────

@router.post("/", response_model=PropertyRead)
def create_property(
    *,
    session: Session = Depends(get_session),
    property_in: PropertyCreate,
    current_user: User = Depends(get_current_staff_user)
):
    service = PropertyService(session)
    return service.create_property(property_in)


@router.get("/", response_model=List[PropertyRead])
def read_properties(
    *,
    session: Session = Depends(get_session),
    city: Optional[str] = None,
    max_guests: Optional[int] = None,
    active: Optional[bool] = None,
    featured: Optional[bool] = None,
    offset: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_staff_user)
):
    service = PropertyService(session)
    return service.get_properties(
        city, max_guests, active, featured, offset, limit,
        start_date=start_date, end_date=end_date
    )


@router.get("/public", response_model=List[PropertyPublicRead])
def read_public_properties(
    *,
    session: Session = Depends(get_session),
    city: Optional[str] = None,
    max_guests: Optional[int] = None,
    featured: Optional[bool] = None,
    offset: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    service = PropertyService(session)
    return service.get_properties(
        city, max_guests, True, featured, offset, limit,
        start_date=start_date, end_date=end_date
    )


@router.get("/{property_id}/availability", response_model=AvailabilityResponse)
def get_property_availability(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
):
    """
    Returns all blocked date ranges for a property — public endpoint.

    Aggregates data from:
    - Confirmed Reservations (reservation_type: commercial / owner_use)
    - Imported CalendarBlocks (source: airbnb, booking, manual, etc.)

    Use this to render the availability calendar on the Property Detail page.
    Results are sorted chronologically by start_date.
    """
    service = PropertyService(session)
    return service.get_availability(property_id)


@router.get("/{property_id}", response_model=PropertyRead)
def read_property(
    *, 
    session: Session = Depends(get_session), 
    property_id: uuid.UUID,
    current_user: User = Depends(get_current_staff_user)
):
    service = PropertyService(session)
    return service.get_property_by_id(property_id)


@router.get("/public/{slug}", response_model=PropertyPublicRead)
def read_public_property_by_slug(*, session: Session = Depends(get_session), slug: str):
    service = PropertyService(session)
    return service.get_property_by_slug(slug)


@router.patch("/{property_id}", response_model=PropertyRead)
def update_property(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    property_in: PropertyUpdate,
    current_user: User = Depends(get_current_staff_user)
):
    service = PropertyService(session)
    return service.update_property(property_id, property_in)


@router.get("/{property_id}/whatsapp-link")
def get_property_whatsapp_link(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    lang: str = "es",
    source: Optional[str] = None
):
    service = PropertyService(session)
    url = service.get_whatsapp_link(property_id, lang, source)
    return {"url": url}


@router.post("/{property_id}/images", response_model=PropertyRead)
def upload_property_image(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    file: UploadFile = File(...),
    is_main: bool = False,
    current_user: User = Depends(get_current_staff_user)
):
    service = PropertyService(session)
    return service.upload_image(property_id, file, is_main)


@router.delete("/{property_id}/images/{image_id}", response_model=PropertyRead)
def delete_property_image(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    image_id: uuid.UUID,
    current_user: User = Depends(get_current_staff_user)
):
    """
    Delete a property image.

    - Removes image from database
    - Deletes physical file from storage
    - If deleted image was main, promotes another image
    - Returns updated property
    """
    service = PropertyService(session)
    return service.delete_image(property_id, image_id, current_user)


@router.delete("/{property_id}", status_code=204)
def delete_property(
    *,
    session: Session = Depends(get_session),
    property_id: uuid.UUID,
    current_user: User = Depends(get_current_staff_user)
):
    service = PropertyService(session)
    service.delete_property(property_id)
    return None
