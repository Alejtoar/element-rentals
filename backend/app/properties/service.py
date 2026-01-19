import uuid
from typing import List, Optional
from fastapi import HTTPException, status, UploadFile
from sqlmodel import Session
from app.properties.models import Property, PropertyImage
from app.properties.repository import PropertyRepository
from app.properties.schemas import PropertyCreate, PropertyUpdate
from app.media.storage import get_storage_provider

class PropertyService:
    def __init__(self, session: Session):
        self.repository = PropertyRepository(session)

    def get_property_by_id(self, property_id: uuid.UUID) -> Property:
        property = self.repository.get_by_id(property_id)
        if not property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found"
            )
        return property

    def get_properties(
        self, 
        city: Optional[str] = None, 
        max_guests: Optional[int] = None, 
        active: Optional[bool] = None, 
        featured: Optional[bool] = None,
        offset: int = 0, 
        limit: int = 100
    ) -> List[Property]:
        return self.repository.get_all(city, max_guests, active, featured, offset, limit)

    def create_property(self, property_in: PropertyCreate) -> Property:
        property = Property.from_orm(property_in)
        return self.repository.create(property)

    def update_property(self, property_id: uuid.UUID, property_in: PropertyUpdate) -> Property:
        property = self.get_property_by_id(property_id)
        update_data = property_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(property, key, value)
        return self.repository.update(property)

    def upload_image(self, property_id: uuid.UUID, file: UploadFile, is_main: bool = False) -> Property:
        # Verify property exists
        self.get_property_by_id(property_id)
        
        storage = get_storage_provider()
        # Safe filename generation
        extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"{property_id}_{uuid.uuid4()}.{extension}"
        url = storage.upload_file(file, filename)
        
        if is_main:
            # Business Logic: Ensure only one is_main image
            existing_images = self.repository.get_images_by_property_id(property_id)
            for img in existing_images:
                if img.is_main:
                    img.is_main = False
                    self.repository.update_image(img)
                    
        image = PropertyImage(
            property_id=property_id,
            url=url,
            is_main=is_main,
            order=0
        )
        self.repository.create_image(image)
        
        # Return refreshed property
        return self.get_property_by_id(property_id)

    def get_whatsapp_link(self, property_id: uuid.UUID, lang: str = "es", source: Optional[str] = None) -> str:
        property = self.get_property_by_id(property_id)
        from app.utils.whatsapp import generate_whatsapp_link
        return generate_whatsapp_link("guest", lang, property.name, source)
