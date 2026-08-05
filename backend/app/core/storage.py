import abc
import os
import uuid
from app.core.config import settings

class BaseStorageService(abc.ABC):
    @abc.abstractmethod
    def save_file(self, content: bytes, filename: str, content_type: str) -> str:
        """Saves a file, returning its public resource path or URL."""
        pass

class LocalStorageService(BaseStorageService):
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR) -> None:
        self.upload_dir = upload_dir
        # Create directory path on initialization if missing
        os.makedirs(self.upload_dir, exist_ok=True)

    def save_file(self, content: bytes, filename: str, content_type: str) -> str:
        """Saves media content to local uploads directory with a unique UUID name."""
        ext = os.path.splitext(filename)[1]
        # Safeguard file naming collisions using UUID
        unique_filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(self.upload_dir, unique_filename)
        
        with open(filepath, "wb") as f:
            f.write(content)
            
        # Return path representation using standard web slashes
        return f"/uploads/{unique_filename}"
