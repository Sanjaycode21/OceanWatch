import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID, SpatialPoint

class SOSRequest(Base):
    __tablename__ = "sos_requests"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    incident_id = Column(GUID, ForeignKey("fused_incidents.id", ondelete="SET NULL"), nullable=True)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # PostGIS Point geometry coordinates
    geometry = Column(SpatialPoint, nullable=True)
    
    emergency_type = Column(String, nullable=False)  # Sinking, Medical, Stranded Swimmer, etc.
    status = Column(String, default="open", nullable=False)  # open, dispatched, resolved, cancelled
    
    # Operational parameters
    assigned_team = Column(String, nullable=True)  # Rescue team assigned
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="sos_requests")
    incident = relationship("FusedIncident", back_populates="sos_requests")
