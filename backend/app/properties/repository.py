from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from app.properties.models import Property, PropertyImage

class PropertyRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, property_id: UUID) -> Optional[Property]:
        return self.session.get(Property, property_id)

    def get_all(
        self, 
        city: Optional[str] = None, 
        max_guests: Optional[int] = None, 
        active: Optional[bool] = None, 
        featured: Optional[bool] = None,
        offset: int = 0, 
        limit: int = 100
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
