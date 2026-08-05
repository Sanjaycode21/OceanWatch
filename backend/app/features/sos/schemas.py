import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class SOSRequestCreate(BaseModel):
    latitude: float
    longitude: float
    emergency_type: str

class SOSRequestUpdate(BaseModel):
    status: Optional[str] = None  # open, accepted, resolved, cancelled
    assigned_team: Optional[str] = None  # Rescue team assigned

class SOSRequestResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    incident_id: Optional[uuid.UUID] = None
    latitude: float
    longitude: float
    emergency_type: str
    status: str
    assigned_team: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
