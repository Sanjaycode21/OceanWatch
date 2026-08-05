import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String, Text
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

class FusedIncident(Base):
    __tablename__ = "fused_incidents"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    hazard_type = Column(String, index=True, nullable=False)
    
    # Centroid coordinate point
    latitude = Column(Float, nullable=False, default=0.0)
    longitude = Column(Float, nullable=False, default=0.0)
    center_geometry = Column(SpatialPoint, nullable=True)
    radius = Column(Float, default=0.0, nullable=False)  # Incident coverage radius in meters
    summary = Column(Text, nullable=True)
    
    incident_confidence = Column(Float, default=0.0, nullable=False)
    priority = Column(String, default="medium", nullable=False)  # low, medium, high, critical
    status = Column(String, default="unverified", nullable=False)  # unverified, under_review, probable, confirmed, resolved
    supporting_reports = Column(Integer, default=0, nullable=False)
    
    # Operation and resolution parameters
    assigned_team = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    reports = relationship("Report", back_populates="incident")
    alerts = relationship("Alert", back_populates="incident", cascade="all, delete-orphan")
    sos_requests = relationship("SOSRequest", back_populates="incident")
