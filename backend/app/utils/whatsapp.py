import urllib.parse
from typing import Optional
from app.config import settings

TEMPLATES = {
    "en": {
        "guest": "Hello, I am interested in property {property_name}",
        "owner": "Hello, I want to publish my property with Elemnt Rentals"
    },
    "es": {
        "guest": "Hola, estoy interesado en la propiedad {property_name}",
        "owner": "Hola, quiero publicar mi propiedad con Elemnt Rentals"
    }
}

def generate_whatsapp_link(
    lead_type: str, # guest, owner
    lang: str = "es",
    property_name: Optional[str] = None,
    source: Optional[str] = None
) -> str:
    # Truncate inputs to prevent URL length issues and basic DoS
    safe_property_name = (property_name or "")[:100]
    safe_source = (source or "")[:50]
    
    template = TEMPLATES.get(lang, TEMPLATES["es"]).get(lead_type, "")
    message = template.format(property_name=safe_property_name)
    
    if safe_source:
        message += f" (Ref: {safe_source})"
    
    # urllib.parse.quote handles the URL encoding of characters
    encoded_message = urllib.parse.quote(message)
    return f"https://wa.me/{settings.WHATSAPP_PHONE}?text={encoded_message}"
