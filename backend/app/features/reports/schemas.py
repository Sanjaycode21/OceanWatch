import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ReportBase(BaseModel):
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timestamp: datetime
    device_id: Optional[str] = None

class ReportCreate(ReportBase):
    user_id: Optional[uuid.UUID] = None

class ReportUpdate(BaseModel):
    description: Optional[str] = None

class ReportResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    hazard_type: Optional[str] = None
    hazard_category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    timestamp: datetime
    device_id: Optional[str] = None
    report_status: str
    detection_confidence: Optional[float] = None
    credibility_score: Optional[float] = None
    ai_reasoning: Optional[str] = None
    verification_status: str
    incident_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    
    # Extended AI fields
    severity: Optional[str] = None
    visible_evidence: Optional[List[str]] = []
    possible_impacts: Optional[List[str]] = []
    recommended_action: Optional[str] = None
    supporting_factors: Optional[List[str]] = []
    contradicting_factors: Optional[List[str]] = []
    incident_confidence: Optional[float] = None

    class Config:
        from_attributes = True

# Offline Batch Sync Schemas
class ReportSyncItem(ReportBase):
    image_base64: Optional[str] = None  # Base64 encoded image string (safe for JSON payload)
    video_base64: Optional[str] = None  # Base64 encoded video string

class ReportSyncRequest(BaseModel):
    reports: List[ReportSyncItem]

class ReportSyncResponseItem(BaseModel):
    success: bool
    temp_index: int
    report_id: Optional[uuid.UUID] = None
    error: Optional[str] = None

class ReportSyncResponse(BaseModel):
    processed: int
    results: List[ReportSyncResponseItem]
