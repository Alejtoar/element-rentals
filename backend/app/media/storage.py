import shutil
import os
from typing import Protocol
from fastapi import UploadFile
from app.config import settings

class StorageProvider(Protocol):
    def upload_file(self, file: UploadFile, destination: str) -> str:
        ...

class LocalStorageProvider:
    def __init__(self, upload_dir: str = "uploads/properties"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def upload_file(self, file: UploadFile, filename: str) -> str:
        from fastapi import HTTPException, status
        from app.media.image_optimizer import ImageOptimizer
        
        # Validate file size before processing
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if not ImageOptimizer.validate_file_size(file_size):
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed size of {ImageOptimizer.MAX_FILE_SIZE_MB}MB"
            )
        
        # Save original file
        file_path = os.path.join(self.upload_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Optimize image (resize, compress, generate thumbnail)
        try:
            ImageOptimizer.optimize_image(file_path)
        except Exception as e:
            # If optimization fails, delete the file and raise error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to optimize image: {str(e)}"
            )
        
        # Return a relative URL or path that the frontend can access
        # URL format: /uploads/properties/{filename}
        return f"/uploads/properties/{filename}"

def get_storage_provider() -> StorageProvider:
    # Phase 1: simple local storage
    # In future: return S3StorageProvider() if settings.StorageType == "S3"
    return LocalStorageProvider()
