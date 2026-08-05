from sqlalchemy import Column, Integer, String
from app.core.database import Base

class HazardCategory(Base):
    __tablename__ = "hazard_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
