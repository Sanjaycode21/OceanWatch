import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID, SpatialPoint
from app.core.config import settings

# Dynamically select spatial column type based on active database dialect
if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
    from sqlalchemy import String as SQLString
    SpatialPoint = SQLString(100)
else:
    from geoalchemy2 import Geometry
    SpatialPoint = Geometry(geometry_type="POINT", srid=4326, spatial_index=True)

class Report(Base):
    __tablename__ = "reports"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Hazard types and categories are set to nullable, since AI classifies them post-submission
    hazard_type = Column(String, index=True, nullable=True)
    hazard_category = Column(String, index=True, nullable=True)
    
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geometry = Column(SpatialPoint, nullable=True)
    
    address = Column(String, nullable=True)
    
    # Timestamp represents when the citizen observed the hazard (provided by client)
    timestamp = Column(DateTime, nullable=False)
    device_id = Column(String, nullable=True)
    
    # State tracking metrics
    report_status = Column(String, default="PENDING_AI_ANALYSIS", nullable=False)
    detection_confidence = Column(Float, nullable=True)
    credibility_score = Column(Float, nullable=True)
    ai_reasoning = Column(Text, nullable=True)
    verification_status = Column(String, default="needs_review", nullable=False)  # verified, needs_review, rejected
    
    incident_id = Column(GUID, ForeignKey("fused_incidents.id", ondelete="SET NULL"), nullable=True)
    
    # Date markers (created_at represents when ingested in DB)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    
    # Soft delete tracker
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="reports")
    incident = relationship("FusedIncident", back_populates="reports")
    credibility_factors = relationship("CredibilityFactor", back_populates="report", cascade="all, delete-orphan")


class CredibilityFactor(Base):
    __tablename__ = "credibility_factors"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(GUID, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)
    
    factor_name = Column(String, nullable=False)  # e.g., "Wind Speed", "GPS Validation"
    factor_category = Column(String, nullable=False)  # e.g., "universal", "weather", "pollution"
    factor_score = Column(Float, nullable=False)  # 0.0 to 100.0
    weight = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    reason = Column(Text, nullable=True)

    # Relationships
    report = relationship("Report", back_populates="credibility_factors")
