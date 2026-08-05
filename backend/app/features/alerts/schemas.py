import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class AlertCreate(BaseModel):
    incident_id: uuid.UUID
    alert_type: str  # High Wave Warning, Oil Spill Advisory, SOS Dispatch
    recipient_type: str  # citizen, authority
    delivery_channel: str  # sms, push, dashboard
    recipient_id: Optional[uuid.UUID] = None

class AlertResponse(BaseModel):
    id: uuid.UUID
    incident_id: uuid.UUID
    alert_type: str
    recipient_type: str
    recipient_id: Optional[uuid.UUID] = None
    delivery_channel: str
    status: str
    sent_at: datetime

    class Config:
        from_attributes = True
