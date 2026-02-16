"""
Image optimization service for property images.
Handles resizing, compression, and thumbnail generation.
"""
from PIL import Image
from io import BytesIO
from pathlib import Path
from typing import Tuple
import os


class ImageOptimizer:
    """Optimizes images for web display and storage."""
    
    # Configuration
    MAX_WIDTH = 1920  # Maximum width for full-size images
    MAX_HEIGHT = 1080  # Maximum height for full-size images
    THUMBNAIL_SIZE = (400, 300)  # Thumbnail dimensions
    QUALITY = 85  # JPEG quality (1-100)
    MAX_FILE_SIZE_MB = 10  # Maximum upload size in MB
    
    @staticmethod
    def validate_file_size(file_size: int) -> bool:
        """
        Validate that file size is within limits.
        
        Args:
            file_size: Size in bytes
            
        Returns:
            True if valid, False otherwise
        """
        max_bytes = ImageOptimizer.MAX_FILE_SIZE_MB * 1024 * 1024
        return file_size <= max_bytes
    
    @staticmethod
    def optimize_image(image_path: str) -> Tuple[str, str]:
        """
        Optimize an image by resizing and compressing.
        Also generates a thumbnail version.
        
        Args:
            image_path: Path to the original image
            
        Returns:
            Tuple of (optimized_path, thumbnail_path)
        """
        # Open image
        with Image.open(image_path) as img:
            # Convert to RGB if necessary (handles PNG with alpha, etc.)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if larger than max dimensions
            img.thumbnail((ImageOptimizer.MAX_WIDTH, ImageOptimizer.MAX_HEIGHT), Image.Resampling.LANCZOS)
            
            # Save optimized version (overwrite original)
            img.save(
                image_path,
                'JPEG',
                quality=ImageOptimizer.QUALITY,
                optimize=True,
                progressive=True  # Progressive JPEG for better web loading
            )
            
            # Generate thumbnail
            thumbnail_path = ImageOptimizer._get_thumbnail_path(image_path)
            thumbnail = img.copy()
            thumbnail.thumbnail(ImageOptimizer.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
            thumbnail.save(
                thumbnail_path,
                'JPEG',
                quality=ImageOptimizer.QUALITY,
                optimize=True
            )
            
            return image_path, thumbnail_path
    
    @staticmethod
    def _get_thumbnail_path(image_path: str) -> str:
        """
        Generate thumbnail path from original image path.
        Example: /uploads/properties/abc.jpg -> /uploads/properties/thumbs/abc.jpg
        """
        path = Path(image_path)
        thumb_dir = path.parent / 'thumbs'
        thumb_dir.mkdir(exist_ok=True)
        return str(thumb_dir / path.name)
    
    @staticmethod
    def get_thumbnail_url(image_url: str) -> str:
        """
        Convert image URL to thumbnail URL.
        Example: /uploads/properties/abc.jpg -> /uploads/properties/thumbs/abc.jpg
        """
        parts = image_url.rsplit('/', 1)
        if len(parts) == 2:
            return f"{parts[0]}/thumbs/{parts[1]}"
        return image_url
