import shutil
import os
from typing import Protocol
from fastapi import UploadFile
from app.config import settings

class StorageProvider(Protocol):
    def upload_file(self, file: UploadFile, destination: str) -> str:
        ...

class LocalStorageProvider:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def upload_file(self, file: UploadFile, filename: str) -> str:
        file_path = os.path.join(self.upload_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return a relative URL or path that the frontend can access
        # For local dev, we might serve this via StaticFiles (to be added to main.py later if needed)
        return f"/static/{filename}"

def get_storage_provider() -> StorageProvider:
    # Phase 1: simple local storage
    # In future: return S3StorageProvider() if settings.StorageType == "S3"
    return LocalStorageProvider()
