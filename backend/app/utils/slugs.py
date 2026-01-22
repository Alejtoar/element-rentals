import re
import unicodedata

def generate_slug(text: str) -> str:
    """
    Generates a slug from the given text.
    Example: 'Luxury Villa Tulum' -> 'luxury-villa-tulum'
    """
    # Normalize unicode characters to remove accents
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    # Lowercase
    text = text.lower()
    # Replace non-alphanumeric characters with hyphens
    text = re.sub(r'[^a-z0-9]+', '-', text)
    # Strip leading/trailing hyphens
    text = text.strip('-')
    return text
