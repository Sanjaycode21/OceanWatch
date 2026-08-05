from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import desc, asc
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.features.reports.models import Report
from app.features.reports.schemas import ReportUpdate
from app.core.config import settings

def create_report(
    db: Session,
    user_id: Optional[str],
    latitude: float,
    longitude: float,
    timestamp: datetime,
    description: Optional[str] = None,
    device_id: Optional[str] = None,
    image_url: Optional[str] = None,
    video_url: Optional[str] = None
) -> Report:
    """Inserts a new report, converting coordinate pairs to PostGIS Point format if active."""
    point_wkt = f"POINT({longitude} {latitude})"
    if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        location_val = point_wkt
    else:
        location_val = func.ST_GeomFromText(point_wkt, 4326)

    db_obj = Report(
        user_id=user_id,
        description=description,
        latitude=latitude,
        longitude=longitude,
        geometry=location_val,
        timestamp=timestamp,
        device_id=device_id,
        image_url=image_url,
        video_url=video_url,
        report_status="PENDING_AI_ANALYSIS",
        verification_status="needs_review"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_report(db: Session, report_id: str) -> Optional[Report]:
    """Retrieves a single active report by ID, filtering out soft-deleted files."""
    return db.query(Report).filter(
        Report.id == report_id,
        Report.deleted_at == None
    ).first()

def get_reports_for_user(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc"
) -> List[Report]:
    """Retrieves paginated list of reports for a citizen, support sorting and status filtering."""
    query = db.query(Report).filter(
        Report.user_id == user_id,
        Report.deleted_at == None
    )
    
    if status_filter:
        query = query.filter(Report.report_status == status_filter)
        
    sort_column = getattr(Report, sort_by, Report.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
        
    return query.offset(skip).limit(limit).all()

def update_report(db: Session, db_report: Report, obj_in: ReportUpdate) -> Report:
    """Updates editable text parameters for a report."""
    if obj_in.description is not None:
        db_report.description = obj_in.description
    db_report.updated_at = datetime.now(timezone.utc)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def soft_delete_report(db: Session, db_report: Report) -> Report:
    """Soft deletes a report by setting its deleted_at timestamp."""
    db_report.deleted_at = datetime.now(timezone.utc)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report
