from datetime import date
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from sqlalchemy import exists, and_
from app.properties.models import Property, PropertyImage

class PropertyRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, property_id: UUID) -> Optional[Property]:
        return self.session.get(Property, property_id)

    def get_by_slug(self, slug: str) -> Optional[Property]:
        statement = select(Property).where(Property.slug == slug)
        return self.session.exec(statement).first()

    def get_all(
        self,
        city: Optional[str] = None,
        max_guests: Optional[int] = None,
        active: Optional[bool] = None,
        featured: Optional[bool] = None,
        offset: int = 0,
        limit: int = 100,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[Property]:
        query = select(Property)
        if city:
            query = query.where(Property.city == city)
        if max_guests:
            query = query.where(Property.max_guests >= max_guests)
        if active is not None:
            query = query.where(Property.active == active)
        if featured is not None:
            query = query.where(Property.featured == featured)

        # ── Availability filter ──────────────────────────────────────────────
        # Standard overlap: a block overlaps the requested range when:
        #     block.start_date < req_end  AND  block.end_date > req_start
        # We EXCLUDE any property where such an overlap exists in either
        # the Reservation table or the CalendarBlock table.
        if start_date and end_date:
            # Lazy imports to avoid circular dependency at module load time
            # (reservations/models.py has a forward-ref back to Property)
            from app.reservations.models import Reservation
            from app.calendar.models import CalendarBlock

            # 1. Exclude properties with overlapping confirmed reservations
            has_reservation_overlap = exists().where(
                and_(
                    Reservation.property_id == Property.id,
                    Reservation.status != "cancelled",
                    Reservation.start_date < end_date,
                    Reservation.end_date > start_date,
                )
            )
            # 2. Exclude properties with overlapping calendar blocks
            has_block_overlap = exists().where(
                and_(
                    CalendarBlock.property_id == Property.id,
                    CalendarBlock.start_date < end_date,
                    CalendarBlock.end_date > start_date,
                )
            )
            query = query.where(~has_reservation_overlap)
            query = query.where(~has_block_overlap)

        query = query.order_by(Property.featured.desc(), Property.created_at.desc())
        return self.session.exec(query.offset(offset).limit(limit)).all()

    def create(self, property: Property) -> Property:
        self.session.add(property)
        self.session.commit()
        self.session.refresh(property)
        return property

    def update(self, property: Property) -> Property:
        self.session.add(property)
        self.session.commit()
        self.session.refresh(property)
        return property

    def get_images_by_property_id(self, property_id: UUID) -> List[PropertyImage]:
        statement = select(PropertyImage).where(PropertyImage.property_id == property_id)
        return self.session.exec(statement).all()

    def create_image(self, image: PropertyImage) -> PropertyImage:
        self.session.add(image)
        self.session.commit()
        self.session.refresh(image)
        return image

    def update_image(self, image: PropertyImage) -> PropertyImage:
        self.session.add(image)
        self.session.commit()
        self.session.refresh(image)
        return image

    def delete(self, property: Property) -> None:
        self.session.delete(property)
        self.session.commit()
