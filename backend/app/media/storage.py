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
        file_path = os.path.join(self.upload_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return a relative URL or path that the frontend can access
        # URL format: /uploads/properties/{filename}
        return f"/uploads/properties/{filename}"

def get_storage_provider() -> StorageProvider:
    # Phase 1: simple local storage
    # In future: return S3StorageProvider() if settings.StorageType == "S3"
    return LocalStorageProvider()
