from datetime import datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.api import deps
from app.core.config import settings
from app.features.users.models import User
from app.features.sos.models import SOSRequest
from app.features.incidents.models import FusedIncident
from app.features.alerts.sms_provider import MockSMSProvider
from app.features.alerts.notifier import AlertNotifier
from app.features.sos import schemas

router = APIRouter(prefix="/sos", tags=["sos"])

@router.post("/", response_model=schemas.SOSRequestResponse, status_code=status.HTTP_201_CREATED)
def create_sos_request(
    sos_in: schemas.SOSRequestCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Stores an incoming citizen distress signal, fuses/creates a critical Incident, and triggers SMS alerts."""
    point_wkt = f"POINT({sos_in.longitude} {sos_in.latitude})"
    if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        location_val = point_wkt
    else:
        location_val = func.ST_GeomFromText(point_wkt, 4326)

    # 1. Search for active matching incident within ~500m geofence window to group under
    time_limit = datetime.now(timezone.utc) - timedelta(hours=12)
    matched_incident = db.query(FusedIncident).filter(
        FusedIncident.created_at >= time_limit,
        FusedIncident.status != "resolved",
        FusedIncident.latitude.between(sos_in.latitude - 0.005, sos_in.latitude + 0.005),
        FusedIncident.longitude.between(sos_in.longitude - 0.005, sos_in.longitude + 0.005)
    ).first()

    if matched_incident:
        # Escalate matched incident status to critical priority
        matched_incident.priority = "critical"
        matched_incident.status = "confirmed"
        incident_obj = matched_incident
        db.add(matched_incident)
    else:
        # Create a new critical incident Centroid
        incident_obj = FusedIncident(
            hazard_type=sos_in.emergency_type,
            latitude=sos_in.latitude,
            longitude=sos_in.longitude,
            center_geometry=location_val,
            radius=100.0,
            incident_confidence=100.0,
            supporting_reports=1,
            status="confirmed",
            priority="critical"
        )
        db.add(incident_obj)
        
    db.commit()
    db.refresh(incident_obj)

    # 2. Save SOSRequest record
    sos = SOSRequest(
        user_id=current_user.id,
        incident_id=incident_obj.id,
        latitude=sos_in.latitude,
        longitude=sos_in.longitude,
        geometry=location_val,
        emergency_type=sos_in.emergency_type,
        status="open"
    )
    db.add(sos)
    db.commit()
    db.refresh(sos)

    # 3. Dispatch urgent SMS warnings to authorities
    sms_provider = MockSMSProvider()
    AlertNotifier.dispatch_authority_alert(
        db=db,
        sms_provider=sms_provider,
        incident=incident_obj,
        hazard_type=sos_in.emergency_type,
        alert_reason="Active Citizen SOS distress signal",
        is_sos=True
    )

    # Broadcast to SSE
    from app.core.events import publisher
    publisher.broadcast_sync("sos_created", {
        "id": str(sos.id),
        "emergency_type": sos.emergency_type,
        "latitude": sos.latitude,
        "longitude": sos.longitude,
        "status": sos.status,
        "created_at": sos.created_at.isoformat()
    })

    return sos


@router.get("/", response_model=List[schemas.SOSRequestResponse])
def read_sos_requests(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Retrieves a list of all active SOS emergency dispatch requests. Restricted to authorities."""
    return db.query(SOSRequest).filter(
        SOSRequest.status.in_(["open", "dispatched", "accepted"])
    ).all()

@router.patch("/{id}", response_model=schemas.SOSRequestResponse)
def patch_sos_request(
    id: str,
    sos_in: schemas.SOSRequestUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Updates the status and rescue team parameters for an SOS emergency request."""
    sos = db.query(SOSRequest).filter(SOSRequest.id == id).first()
    if not sos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SOS request not found"
        )
        
    update_data = sos_in.model_dump(exclude_unset=True)
    
    # Auto-resolve time
    if update_data.get("status") in ["resolved", "cancelled"]:
        sos.resolved_at = datetime.now(timezone.utc)
        
    for field in update_data:
        setattr(sos, field, update_data[field])
        
    db.add(sos)
    db.commit()
    db.refresh(sos)

    # Broadcast to SSE
    from app.core.events import publisher
    publisher.broadcast_sync("sos_updated", {
        "id": str(sos.id),
        "emergency_type": sos.emergency_type,
        "latitude": sos.latitude,
        "longitude": sos.longitude,
        "status": sos.status,
        "assigned_team": sos.assigned_team,
        "resolved_at": sos.resolved_at.isoformat() if sos.resolved_at else None
    })

    return sos
