from typing import List, Optional
from sqlalchemy.orm import Session
from app.features.reports.models import Report
from app.features.incidents.models import FusedIncident
from app.features.alerts.models import Alert
from app.features.alerts.sms_provider import BaseSMSProvider, MockSMSProvider
from app.features.alerts.notifier import AlertNotifier
from app.features.ai.interfaces import BaseAlertEngine

class MockAlertEngine(BaseAlertEngine):
    def __init__(self, sms_provider: Optional[BaseSMSProvider] = None) -> None:
        """Injects SMS provider abstraction client into the Alert Engine."""
        self.sms_provider = sms_provider or MockSMSProvider()

    def evaluate_alerts(self, db: Session, report: Report, incident: Optional[FusedIncident]) -> List[Alert]:
        """Creates notification logs and dispatches SMS alerts based on risk triggers."""
        # 1. Resolve active Incident (required by alerts table foreign key)
        active_incident = incident
        if not active_incident and report.incident_id:
            active_incident = db.query(FusedIncident).filter(FusedIncident.id == report.incident_id).first()

        if not active_incident:
            # Database requires incident_id for alerts, return empty if not grouped
            return []

        warrants_alert = False
        if report.verification_status == "Verified":
            warrants_alert = True
        if active_incident.priority in ["critical", "high"] or active_incident.status == "confirmed":
            warrants_alert = True

        if not warrants_alert:
            return []

        # 2. Dispatch geolocated SMS warning to nearby citizens
        AlertNotifier.dispatch_citizen_alert(
            db=db,
            sms_provider=self.sms_provider,
            incident=active_incident,
            hazard_type=report.hazard_type or "Ocean Hazard",
            hazard_category=report.hazard_category or "Ocean Weather"
        )

        # 3. Dispatch critical SMS alert to coastal authorities
        AlertNotifier.dispatch_authority_alert(
            db=db,
            sms_provider=self.sms_provider,
            incident=active_incident,
            hazard_type=report.hazard_type or "Ocean Hazard",
            alert_reason=f"Priority Level {active_incident.priority.upper()}"
        )

        # Query all alerts logged for this incident to return to orchestrator
        alerts_generated = db.query(Alert).filter(Alert.incident_id == active_incident.id).all()
        return alerts_generated
