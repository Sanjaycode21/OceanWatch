from app.features.ai.interfaces import (
    BaseHazardDetectionService,
    BaseEvidenceCollectionService,
    BaseIncidentIntelligenceEngine,
    BaseAlertEngine
)
from app.features.ai.detection import MockHazardDetectionService, GeminiHazardDetectionService
from app.features.ai.evidence import MockEvidenceCollectionService
from app.features.ai.credibility import CredibilityEngine
from app.features.ai.intelligence import MockIncidentIntelligenceEngine
from app.features.ai.alerts import MockAlertEngine
from app.features.ai.orchestrator import AIOrchestrator
