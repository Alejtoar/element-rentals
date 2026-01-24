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

    def delete_image(
        self, 
        property_id: uuid.UUID, 
        image_id: uuid.UUID,
        current_user: "User"
    ) -> Property:
        """
        Delete a property image.
        
        Args:
            property_id: UUID of the property
            image_id: UUID of the image to delete
            current_user: User performing the deletion (for audit logging)
            
        Returns:
            Updated Property with remaining images
            
        Raises:
            HTTPException: If property or image not found or path validation fails
        """
        import os
        from pathlib import Path
        from sqlmodel import select
        
        # Verify property exists
        property = self.get_property_by_id(property_id)
        
        # Find and verify image belongs to this property
        image = self.repository.session.get(PropertyImage, image_id)
        if not image or image.property_id != property_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
        
        # Check if this was the main image
        was_main = image.is_main
        
        # Delete physical file from storage
        try:
            # Extract filename from URL (e.g., "/uploads/properties/filename.jpg" -> "filename.jpg")
            filename = image.url.split("/")[-1]
            file_path = Path("uploads") / "properties" / filename
            
            # Security: Validate path is within uploads/properties directory
            uploads_dir = Path("uploads") / "properties"
            try:
                resolved_path = file_path.resolve()
                resolved_uploads = uploads_dir.resolve()
                
                # Check if resolved path starts with uploads directory
                if not str(resolved_path).startswith(str(resolved_uploads)):
                    logger.error(
                        f"Path traversal attempt detected - "
                        f"image_id={image_id}, "
                        f"property_id={property_id}, "
                        f"url={image.url}, "
                        f"resolved_path={resolved_path}"
                    )
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Invalid file path"
                    )
            except ValueError as e:
                logger.error(f"Invalid file path: {file_path}, error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Invalid file path"
                )
            
            if file_path.exists():
                os.remove(file_path)
                logger.info(f"Deleted file: {file_path}")
            else:
                logger.warning(f"File not found for deletion: {file_path}")
        except HTTPException:
            # Re-raise HTTP exceptions (path validation failures)
            raise
        except Exception as e:
            # Log error but don't fail the request for other file system errors
            logger.error(f"Failed to delete file {image.url}: {e}", exc_info=True)
        
        # Delete from database
        self.repository.session.delete(image)
        self.repository.session.commit()
        
        # Audit logging
        logger.info(
            f"Image deleted - "
            f"image_id={image_id}, "
            f"property_id={property_id}, "
            f"was_main={was_main}, "
            f"url={image.url}, "
            f"deleted_by={current_user.id}, "
            f"deleted_by_email={current_user.email}, "
            f"deleted_by_role={current_user.role}"
        )
        
        # If deleted image was main, promote another image
        if was_main:
            # Get remaining images for this property
            remaining_images = self.repository.session.exec(
                select(PropertyImage)
                .where(PropertyImage.property_id == property_id)
                .order_by(PropertyImage.created_at)
            ).all()
            
            if remaining_images:
                # Promote first image to main
                remaining_images[0].is_main = True
                self.repository.session.add(remaining_images[0])
                self.repository.session.commit()
                logger.info(f"Promoted image {remaining_images[0].id} to main for property {property_id}")
        
        # Refresh and return property with updated images
        self.repository.session.refresh(property)
        return property

    def get_whatsapp_link(self, property_id: uuid.UUID, lang: str = "es", source: Optional[str] = None) -> str:
        property = self.get_property_by_id(property_id)
        from app.utils.whatsapp import generate_whatsapp_link
        return generate_whatsapp_link("guest", lang, property.name, source)
