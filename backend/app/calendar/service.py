import uuid
from typing import List
from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.properties.models import Property, ExternalCalendar
from app.calendar.schemas import ExternalCalendarCreate


class ExternalCalendarService:
    """
    CRUD operations for ExternalCalendar.
    Manages the external .ics source links registered for a property.
    """

    def __init__(self, db: Session):
        self.db = db

    def _get_property_or_404(self, property_id: uuid.UUID) -> Property:
        db_property = self.db.get(Property, property_id)
        if not db_property:
            raise HTTPException(status_code=404, detail="Property not found")
        return db_property

    def _get_calendar_or_404(
        self, property_id: uuid.UUID, calendar_id: uuid.UUID
    ) -> ExternalCalendar:
        stmt = select(ExternalCalendar).where(
            ExternalCalendar.id == calendar_id,
            ExternalCalendar.property_id == property_id,
        )
        cal = self.db.exec(stmt).first()
        if not cal:
            raise HTTPException(
                status_code=404,
                detail="ExternalCalendar not found for this property",
            )
        return cal

    # ── CRUD ──────────────────────────────────────────────────────────────────

    def list_calendars(self, property_id: uuid.UUID) -> List[ExternalCalendar]:
        self._get_property_or_404(property_id)
        stmt = select(ExternalCalendar).where(
            ExternalCalendar.property_id == property_id
        )
        return self.db.exec(stmt).all()

    def add_calendar(
        self, property_id: uuid.UUID, calendar_in: ExternalCalendarCreate
    ) -> ExternalCalendar:
        self._get_property_or_404(property_id)
        new_cal = ExternalCalendar(
            property_id=property_id,
            name=calendar_in.name,
            url=calendar_in.url,
        )
        self.db.add(new_cal)
        self.db.commit()
        self.db.refresh(new_cal)
        return new_cal

    def delete_calendar(
        self, property_id: uuid.UUID, calendar_id: uuid.UUID
    ) -> None:
        cal = self._get_calendar_or_404(property_id, calendar_id)
        self.db.delete(cal)
        self.db.commit()
