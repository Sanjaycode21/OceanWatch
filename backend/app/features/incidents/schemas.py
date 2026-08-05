import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class FusedIncidentBase(BaseModel):
    hazard_type: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    incident_confidence: float = Field(default=0.0, ge=0.0, le=100.0)
    priority: str = "medium"  # low, medium, high, critical
    status: str = "unverified"  # unverified, under_review, probable, confirmed, resolved
    summary: Optional[str] = None
    assigned_team: Optional[str] = None
    resolution_notes: Optional[str] = None

class FusedIncidentCreate(FusedIncidentBase):
    pass

class FusedIncidentUpdate(BaseModel):
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_team: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None

class FusedIncidentResponse(FusedIncidentBase):
    id: uuid.UUID
    supporting_reports: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Sub-schemas for detailed query mappings
class ReportShortResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    latitude: float
    longitude: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    report_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AlertShortResponse(BaseModel):
    id: uuid.UUID
    alert_type: str
    recipient_type: str
    delivery_channel: str
    status: str
    sent_at: datetime

    class Config:
        from_attributes = True

class FusedIncidentDetailResponse(FusedIncidentResponse):
    reports: List[ReportShortResponse] = []
    alerts: List[AlertShortResponse] = []
    
    supporting_factors: List[str] = []
    contradicting_factors: List[str] = []
    ai_reasoning: Optional[str] = None

    class Config:
        from_attributes = True

class IncidentEvidenceResponse(BaseModel):
    supporting_factors: List[str] = []
    contradicting_factors: List[str] = []
    ai_reasoning: Optional[str] = None
    incident_confidence: float
    credibility_breakdown: List[dict] = []
