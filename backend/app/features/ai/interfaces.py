import abc
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.features.reports.models import Report
from app.features.incidents.models import FusedIncident
from app.features.alerts.models import Alert

class BaseHazardDetectionService(abc.ABC):
    @abc.abstractmethod
    def detect_hazard(self, db: Session, report: Report) -> Dict[str, Any]:
        """Analyzes media and description to classify hazard type and category."""
        pass

class BaseEvidenceCollectionService(abc.ABC):
    @abc.abstractmethod
    def collect_evidence(self, db: Session, report: Report) -> Dict[str, Any]:
        """Gathers environmental, user trust, and neighboring report telemetry."""
        pass

class BaseCredibilityStrategy(abc.ABC):
    @abc.abstractmethod
    def evaluate(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Executes category-specific rules and yields explainable credibility metrics."""
        pass

class BaseIncidentIntelligenceEngine(abc.ABC):
    @abc.abstractmethod
    def evaluate_incident(self, db: Session, report: Report) -> FusedIncident:
        """Identifies duplicate reports and fuses coordinates into incident centroids."""
        pass

class BaseAlertEngine(abc.ABC):
    @abc.abstractmethod
    def evaluate_alerts(self, db: Session, report: Report, incident: Optional[FusedIncident]) -> List[Alert]:
        """Creates notifications for citizens and dispatch alerts for emergency services."""
        pass
