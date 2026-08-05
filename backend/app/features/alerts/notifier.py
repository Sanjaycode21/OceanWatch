import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.features.alerts.models import Alert
from app.features.alerts.sms_provider import BaseSMSProvider
from app.features.reports.models import Report
from app.features.users.models import User
from app.features.incidents.models import FusedIncident

logger = logging.getLogger("alerts.notifier")

class AlertNotifier:
    @staticmethod
    def get_nearby_citizens(db: Session, lat: float, lon: float) -> List[User]:
        """Queries citizens who submitted reports within a ~5.5km bounding box in the last 24h."""
        time_threshold = datetime.utcnow() - timedelta(hours=24)
        
        # Simple bounding box matching +- 0.05 degrees latitude/longitude
        nearby_reports = db.query(Report).filter(
            Report.latitude.between(lat - 0.05, lat + 0.05),
            Report.longitude.between(lon - 0.05, lon + 0.05),
            Report.created_at >= time_threshold
        ).all()
        
        citizens = {}
        for r in nearby_reports:
            if r.user and r.user.role == "citizen" and r.user.phone:
                citizens[r.user.id] = r.user
        return list(citizens.values())

    @staticmethod
    def get_authorities(db: Session) -> List[User]:
        """Queries all system authority and admin users with registered phone numbers."""
        return db.query(User).filter(
            User.role.in_(["authority", "admin"]),
            User.phone != None
        ).all()

    @classmethod
    def dispatch_citizen_alert(
        cls,
        db: Session,
        sms_provider: BaseSMSProvider,
        incident: FusedIncident,
        hazard_type: str,
        hazard_category: str
    ) -> int:
        """Sends location-based warning dispatches to citizens near the incident center coordinates."""
        citizens = cls.get_nearby_citizens(db, incident.latitude, incident.longitude)
        if not citizens:
            logger.info(f"No citizens detected near incident centroid: {incident.latitude}, {incident.longitude}")
            return 0

        alert_type = f"{hazard_type} Warning"
        payload = (
            f"ALERT: OceanWatch has detected a {hazard_type} in your area. "
            f"Category: {hazard_category}. Status: CONFIRMED. "
            "Please stay clear and exercise caution."
        )

        sent_count = 0
        for citizen in citizens:
            success = sms_provider.send_sms(citizen.phone, payload)
            
            # Log Alert to Database
            alert = Alert(
                incident_id=incident.id,
                alert_type=alert_type,
                recipient_type="citizen",
                recipient_id=citizen.id,
                delivery_channel="sms",
                status="sent" if success else "failed",
                sent_at=datetime.utcnow()
            )
            db.add(alert)
            sent_count += 1
            
        db.commit()
        
        # Broadcast to SSE
        from app.core.events import publisher
        publisher.broadcast_sync("alert_created", {
            "incident_id": str(incident.id),
            "alert_type": alert_type,
            "recipient_type": "citizen",
            "delivery_channel": "sms",
            "status": "sent" if sent_count > 0 else "failed"
        })

        return sent_count

    @classmethod
    def dispatch_authority_alert(
        cls,
        db: Session,
        sms_provider: BaseSMSProvider,
        incident: FusedIncident,
        hazard_type: str,
        alert_reason: str,
        is_sos: bool = False
    ) -> int:
        """Dispatches emergency broadcasts to coast guard and authority dispatch operators."""
        authorities = cls.get_authorities(db)
        if not authorities:
            logger.info("No registered authority users with phone numbers found.")
            return 0

        alert_type = "SOS Distress Signal" if is_sos else "Critical Incident Alert"
        prefix = "EMERGENCY SOS" if is_sos else "CRITICAL INCIDENT"
        
        payload = (
            f"{prefix}: OceanWatch AI logged: {hazard_type}. "
            f"Trigger: {alert_reason}. Lat: {incident.latitude:.4f}, Lon: {incident.longitude:.4f}. "
            "Operator intervention and team dispatch required immediately."
        )

        sent_count = 0
        for auth in authorities:
            success = sms_provider.send_sms(auth.phone, payload)
            
            # Log Alert to Database
            alert = Alert(
                incident_id=incident.id,
                alert_type=alert_type,
                recipient_type="authority",
                recipient_id=auth.id,
                delivery_channel="sms",
                status="sent" if success else "failed",
                sent_at=datetime.utcnow()
            )
            db.add(alert)
            sent_count += 1
            
        db.commit()

        # Broadcast to SSE
        from app.core.events import publisher
        publisher.broadcast_sync("alert_created", {
            "incident_id": str(incident.id),
            "alert_type": alert_type,
            "recipient_type": "authority",
            "delivery_channel": "sms",
            "status": "sent" if sent_count > 0 else "failed"
        })

        return sent_count
