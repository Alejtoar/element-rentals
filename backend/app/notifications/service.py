import requests
import logging
import json
import uuid
from datetime import datetime, date
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class WebhookNotifier:
    def __init__(self, webhook_url: Optional[str] = None):
        self.webhook_url = webhook_url or getattr(settings, "NOTIFICATIONS_WEBHOOK_URL", None)

    def notify(self, message: str, payload: Optional[Dict[str, Any]] = None):
        if not self.webhook_url:
            logger.warning("No webhook URL configured for notifications.")
            return

        try:
            # We assume a generic JSON payload for the webhook (Slack/Discord style)
            # For Discord/Slack, usually 'content' or 'text' is the main field.
            data = {
                "text": message,
                "payload": payload or {}
            }
            
            # Simple heuristic for Discord: if URL has 'discord.com/api/webhooks', use 'content'
            if "discord.com" in self.webhook_url:
                data = {"content": message}
            
            # Custom JSON serialization to handle local types if any
            def json_serial(obj):
                if isinstance(obj, (datetime, date)):
                    return obj.isoformat()
                if isinstance(obj, uuid.UUID):
                    return str(obj)
                raise TypeError(f"Type {type(obj)} not serializable")

            json_payload = json.dumps(data, default=json_serial)
            response = requests.post(
                self.webhook_url, 
                data=json_payload, 
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            logger.error(f"Webhook notification failed with status {e.response.status_code}")
        except Exception:
            logger.error("Failed to send webhook notification due to a connection or internal error")

    def notify_lead(self, lead_type: str, lead_data: Dict[str, Any]):
        message = f"🚀 *New {lead_type.capitalize()} Lead Received!*"
        details = (
            f"\n- *Name:* {lead_data.get('name')}"
            f"\n- *Phone:* {lead_data.get('phone')}"
            f"\n- *Message:* {lead_data.get('message', 'N/A')}"
        )
        if lead_type == "guest":
            details += f"\n- *Property:* {lead_data.get('property_name', 'Global Inquiry')}"
            details += f"\n- *Dates:* {lead_data.get('desired_dates', 'N/A')}"
        else:
            details += f"\n- *Location:* {lead_data.get('location', 'N/A')}"
        
        self.notify(message + details, payload=lead_data)
