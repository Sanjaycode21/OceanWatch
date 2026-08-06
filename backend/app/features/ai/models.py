import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(GUID, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Text metadata
    analyzed_description = Column(Text, nullable=True)
    
    # Vision results
    hazard_category = Column(String, index=True, nullable=False)
    hazard_type = Column(String, index=True, nullable=False)
    confidence = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=True)
    
    # Extended vision metadata
    severity = Column(String, nullable=True)
    visible_evidence = Column(JSON, nullable=True)
    possible_impacts = Column(JSON, nullable=True)
    recommended_action = Column(Text, nullable=True)
    
    # Audit timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    report = relationship("Report", back_populates="ai_analysis")
