import uuid
import logging
import requests
from datetime import datetime, date
from typing import List
from icalendar import Calendar, Event
from sqlalchemy.orm import Session
from sqlmodel import select
from fastapi import HTTPException, status

from app.properties.models import Property, ExternalCalendar
from app.reservations.models import Reservation
from app.calendar.models import CalendarBlock
from app.calendar.schemas import SyncResult

logger = logging.getLogger(__name__)


# ─── iCal Export ─────────────────────────────────────────────────────────────

class ICalService:
    """Generates an iCal feed from confirmed Elemnt Reservations (Phase 1 – Export)."""

    @staticmethod
    def generate_property_ical(property_id: uuid.UUID, token: uuid.UUID, db: Session) -> str:
        # 1. Verify property and token
        db_property = db.query(Property).filter(Property.id == property_id).first()
        if not db_property:
            raise HTTPException(status_code=404, detail="Property not found")

        if str(db_property.ical_secret) != str(token):
            raise HTTPException(status_code=403, detail="Invalid iCal token")

        # 2. Create Calendar object
        cal = Calendar()
        cal.add('prodid', '-//Elemnt Rentals//Property Export//EN')
        cal.add('version', '2.0')
        cal.add('x-wr-calname', f"Elemnt - {db_property.name}")

        # 3. Fetch all non-cancelled reservations
        reservations = db.query(Reservation).filter(
            Reservation.property_id == property_id,
            Reservation.status != "cancelled"
        ).all()

        # 4. Add each reservation as an event
        for res in reservations:
            event = Event()
            event.add('summary', 'Reserved (Elemnt)')
            event.add('dtstart', res.start_date)
            event.add('dtend', res.end_date)
            event.add('dtstamp', datetime.utcnow())
            event.add('uid', f"res_{res.id}@elemntrentals.com")
            cal.add_component(event)

        return cal.to_ical().decode("utf-8")


# ─── iCal Import ─────────────────────────────────────────────────────────────

class ICalImportService:
    """
    Synchronizes availability data from external iCal feeds into CalendarBlock entries.

    Strategy (ADR-017 – Replace-by-Source):
    When syncing a given ExternalCalendar, all existing CalendarBlock records with the
    same property_id and source name are deleted before inserting the freshly parsed ones.
    This avoids stale data without needing to diff each individual event.
    """

    def __init__(self, db: Session):
        self.db = db

    # ── Public API ────────────────────────────────────────────────────────────

    def sync_property(self, property_id: uuid.UUID) -> List[SyncResult]:
        """
        Sync all ExternalCalendars registered for a property.
        Returns one SyncResult per calendar.
        """
        db_property = self.db.get(Property, property_id)
        if not db_property:
            raise HTTPException(status_code=404, detail="Property not found")

        external_calendars = self.db.exec(
            select(ExternalCalendar).where(ExternalCalendar.property_id == property_id)
        ).all()

        results: List[SyncResult] = []
        for ext_cal in external_calendars:
            result = self._sync_single_calendar(db_property, ext_cal)
            results.append(result)

        return results

    # ── Private helpers ───────────────────────────────────────────────────────

    def _sync_single_calendar(
        self, db_property: Property, ext_cal: ExternalCalendar
    ) -> SyncResult:
        """
        Fetch, parse, and store blocks from one ExternalCalendar.
        Uses replace-by-source: delete all existing blocks for this source, then insert fresh ones.
        """
        source_name = ext_cal.name.lower()  # e.g., "airbnb", "booking"
        blocks_deleted = 0
        blocks_created = 0

        try:
            # 1. Fetch the .ics file
            ical_text = self._fetch_ical(ext_cal.url)

            # 2. Parse the events
            events = self._parse_events(ical_text)

            # 3. Delete all existing blocks for this property + source
            blocks_deleted = self._delete_existing_blocks(db_property.id, source_name)

            # 4. Insert fresh blocks
            for event_data in events:
                block = CalendarBlock(
                    property_id=db_property.id,
                    start_date=event_data["start_date"],
                    end_date=event_data["end_date"],
                    source=source_name,
                    external_uid=event_data.get("uid"),
                    reason=event_data.get("summary"),
                )
                self.db.add(block)
                blocks_created += 1

            # 5. Update last_sync timestamp
            ext_cal.last_sync = datetime.utcnow()
            self.db.add(ext_cal)
            self.db.commit()

            logger.info(
                "Sync OK: property=%s source=%s deleted=%d created=%d",
                db_property.id, source_name, blocks_deleted, blocks_created
            )

            return SyncResult(
                calendar_id=ext_cal.id,
                calendar_name=ext_cal.name,
                status="ok",
                blocks_deleted=blocks_deleted,
                blocks_created=blocks_created,
            )

        except Exception as exc:
            self.db.rollback()
            logger.error(
                "Sync FAILED: property=%s source=%s error=%s",
                db_property.id, source_name, str(exc)
            )
            return SyncResult(
                calendar_id=ext_cal.id,
                calendar_name=ext_cal.name,
                status="error",
                blocks_deleted=0,
                blocks_created=0,
                error=str(exc),
            )

    def _fetch_ical(self, url: str) -> str:
        """
        Download an .ics file from a URL with strict security:
        - Protocol must be HTTPS.
        - Host must not resolve to internal/private IP ranges (SSRF protection).
        - File size limit: 5MB (Resource exhaustion protection).
        """
        import socket
        import ipaddress
        from urllib.parse import urlparse

        # 1. Check Protocol
        parsed_url = urlparse(url)
        if parsed_url.scheme != "https":
            raise RuntimeError(f"Insecure protocol in iCal URL: {url}. Only HTTPS is allowed.")

        # 2. Prevent SSRF - Resolve and check IP
        try:
            hostname = parsed_url.hostname
            if not hostname:
                 raise RuntimeError(f"Invalid hostname in URL: {url}")
            
            ip_address = socket.gethostbyname(hostname)
            ip = ipaddress.ip_address(ip_address)
            
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                logger.warning(f"SSRF attempt blocked: {url} resolves to internal IP {ip_address}")
                raise RuntimeError(f"Access to internal network is prohibited: {url}")
        except (socket.gaierror, ValueError) as exc:
            raise RuntimeError(f"Could not resolve host or invalid IP for URL: {url}")

        # 3. Fetch with size limit
        MAX_SIZE = 5 * 1024 * 1024  # 5MB
        try:
            # We use stream=True to check Content-Length before downloading everything
            with requests.get(url, timeout=15, stream=True) as response:
                response.raise_for_status()

                # Check Content-Length header if present
                content_length = response.headers.get('Content-Length')
                if content_length and int(content_length) > MAX_SIZE:
                    raise RuntimeError(f"iCal file too large: {content_length} bytes (Max: {MAX_SIZE})")

                # Read content in chunks to enforce limit effectively
                content = []
                total_downloaded = 0
                for chunk in response.iter_content(chunk_size=8192, decode_unicode=True):
                    if chunk:
                        total_downloaded += len(chunk.encode('utf-8') if isinstance(chunk, str) else chunk)
                        if total_downloaded > MAX_SIZE:
                            raise RuntimeError(f"iCal file exceeds size limit during download (Max: {MAX_SIZE})")
                        content.append(chunk)
                
                return "".join(content)

        except requests.exceptions.Timeout:
            raise RuntimeError(f"Timed out fetching iCal from: {url}")
        except requests.exceptions.HTTPError as exc:
            raise RuntimeError(f"HTTP error fetching iCal ({exc.response.status_code}): {url}")
        except requests.exceptions.RequestException as exc:
            raise RuntimeError(f"Error fetching iCal: {str(exc)}")

    def _parse_events(self, ical_text: str) -> List[dict]:
        """
        Parse an iCal text and extract VEVENT components as dicts.
        Each dict has: start_date, end_date, uid (optional), summary (optional).
        Skips events with missing or invalid dates.
        """
        cal = Calendar.from_ical(ical_text)
        events = []

        for component in cal.walk():
            if component.name != "VEVENT":
                continue

            dtstart = component.get("DTSTART")
            dtend = component.get("DTEND")

            if dtstart is None or dtend is None:
                continue

            # icalendar returns vDatetime or vDate — convert to date
            start = self._to_date(dtstart.dt)
            end = self._to_date(dtend.dt)

            if start is None or end is None:
                continue

            uid_prop = component.get("UID")
            summary_prop = component.get("SUMMARY")

            events.append({
                "start_date": start,
                "end_date": end,
                "uid": str(uid_prop) if uid_prop else None,
                "summary": str(summary_prop) if summary_prop else None,
            })

        return events

    def _to_date(self, dt_value) -> date | None:
        """Normalize a datetime or date value to a plain date object."""
        if dt_value is None:
            return None
        if isinstance(dt_value, datetime):
            return dt_value.date()
        if isinstance(dt_value, date):
            return dt_value
        return None

    def _delete_existing_blocks(self, property_id: uuid.UUID, source: str) -> int:
        """
        Delete all CalendarBlock entries for this property and source.
        Returns the number of deleted records.
        """
        existing = self.db.exec(
            select(CalendarBlock).where(
                CalendarBlock.property_id == property_id,
                CalendarBlock.source == source,
            )
        ).all()

        count = len(existing)
        for block in existing:
            self.db.delete(block)
        self.db.flush()  # Apply deletes before insert within the same transaction

        return count
