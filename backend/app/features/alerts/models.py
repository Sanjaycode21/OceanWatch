import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    incident_id = Column(GUID, ForeignKey("fused_incidents.id", ondelete="CASCADE"), nullable=False)
    
    alert_type = Column(String, nullable=False)  # High Wave Warning, Oil Spill Advisory, SOS Dispatch
    recipient_type = Column(String, nullable=False)  # citizen, authority
    recipient_id = Column(GUID, nullable=True)  # Optional link to specific User ID
    delivery_channel = Column(String, nullable=False)  # sms, push, dashboard
    status = Column(String, default="pending", nullable=False)  # pending, sent, failed
    
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    incident = relationship("FusedIncident", back_populates="alerts")
