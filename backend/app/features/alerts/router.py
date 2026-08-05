from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.features.users.models import User
from app.features.alerts.models import Alert
from app.features.alerts import schemas

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[schemas.AlertResponse])
def read_alerts(
    alert_type: Optional[str] = None,
    recipient_type: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Retrieves list of all notification alerts. Supports alert and recipient filters."""
    query = db.query(Alert)
    
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if recipient_type:
        query = query.filter(Alert.recipient_type == recipient_type)
        
    return query.all()

@router.post("/send", response_model=schemas.AlertResponse, status_code=status.HTTP_201_CREATED)
def send_manual_alert(
    alert_in: schemas.AlertCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Creates a new notification record in the database."""
    db_obj = Alert(
        incident_id=alert_in.incident_id,
        alert_type=alert_in.alert_type,
        recipient_type=alert_in.recipient_type,
        recipient_id=alert_in.recipient_id,
        delivery_channel=alert_in.delivery_channel,
        status="sent"  # Mock default delivery state
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
