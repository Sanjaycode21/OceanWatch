from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.features.incidents.models import FusedIncident
from app.features.incidents.schemas import FusedIncidentCreate, FusedIncidentUpdate
from app.core.config import settings

def create_incident(db: Session, obj_in: FusedIncidentCreate) -> FusedIncident:
    """Creates a new fused incident record, setting up geolocations."""
    point_wkt = f"POINT({obj_in.longitude} {obj_in.latitude})"
    if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        location_val = point_wkt
    else:
        location_val = func.ST_GeomFromText(point_wkt, 4326)

    db_obj = FusedIncident(
        hazard_type=obj_in.hazard_type,
        latitude=obj_in.latitude,
        longitude=obj_in.longitude,
        center_geometry=location_val,
        incident_confidence=obj_in.incident_confidence,
        priority=obj_in.priority,
        status=obj_in.status,
        summary=obj_in.summary,
        assigned_team=obj_in.assigned_team,
        resolution_notes=obj_in.resolution_notes
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_incident(db: Session, incident_id: str) -> Optional[FusedIncident]:
    """Retrieves a single incident by its ID."""
    return db.query(FusedIncident).filter(FusedIncident.id == incident_id).first()

def get_incidents(db: Session, skip: int = 0, limit: int = 100) -> List[FusedIncident]:
    """Retrieves a paginated list of fused incidents."""
    return db.query(FusedIncident).offset(skip).limit(limit).all()

def update_incident(
    db: Session, 
    db_obj: FusedIncident, 
    obj_in: FusedIncidentUpdate
) -> FusedIncident:
    """Updates an incident and dynamically updates spatial coordinate columns if coordinates change."""
    update_data = obj_in.model_dump(exclude_unset=True)
    
    # Update coordinates dynamically if changed
    if "latitude" in update_data or "longitude" in update_data:
        lat = update_data.get("latitude", db_obj.latitude)
        lon = update_data.get("longitude", db_obj.longitude)
        point_wkt = f"POINT({lon} {lat})"
        if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
            db_obj.center_geometry = point_wkt
        else:
            db_obj.center_geometry = func.ST_GeomFromText(point_wkt, 4326)

    for field in update_data:
        if field not in ["latitude", "longitude"]:
            setattr(db_obj, field, update_data[field])

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
