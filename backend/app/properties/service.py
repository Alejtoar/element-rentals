import uuid
import logging
from typing import List, Optional
from fastapi import HTTPException, status, UploadFile
from sqlmodel import Session
from app.properties.models import Property, PropertyImage
from app.properties.repository import PropertyRepository
from app.properties.schemas import PropertyCreate, PropertyUpdate
from app.media.storage import get_storage_provider

logger = logging.getLogger(__name__)


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

    def get_property_by_slug(self, slug: str) -> Property:
        property = self.repository.get_by_slug(slug)
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

    def _generate_unique_slug(self, name: str) -> str:
        from app.utils.slugs import generate_slug
        base_slug = generate_slug(name)
        slug = base_slug
        counter = 1
        
        while self.repository.get_by_slug(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def create_property(self, property_in: PropertyCreate) -> Property:
        try:
            # Use model_validate for SQLModel/Pydantic V2 compatibility or direct dict unpacking
            property = Property(**property_in.dict())
            property.slug = self._generate_unique_slug(property.name)
            
            logger.info(f"Creating property with slug: {property.slug}")
            created = self.repository.create(property)
            logger.info(f"Property created successfully: {created.id}")
            return created
        except Exception as e:
            logger.error(f"Property creation failed: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Property creation failed: {str(e)}"
            )

    def update_property(self, property_id: uuid.UUID, property_in: PropertyUpdate) -> Property:
        property = self.get_property_by_id(property_id)
        update_data = property_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(property, key, value)
        return self.repository.update(property)

    def delete_property(self, property_id: uuid.UUID) -> None:
        property = self.get_property_by_id(property_id)
        self.repository.delete(property)

    def upload_image(self, property_id: uuid.UUID, file: UploadFile, is_main: bool = False) -> Property:
        # Verify property exists
        self.get_property_by_id(property_id)
        
        # Security: Validate File Signature (Magic Numbers)
        import filetype
        # Read a small chunk to guess the type
        header = file.file.read(2048)
        file.file.seek(0) # Reset pointer
        
        kind = filetype.guess(header)
        if kind is None or not kind.mime.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Only images are allowed. Detected: {kind.mime if kind else 'unknown'}"
            )

        storage = get_storage_provider()
        # Safe filename generation
        extension = kind.extension if kind else (file.filename.split(".")[-1] if "." in file.filename else "jpg")
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
