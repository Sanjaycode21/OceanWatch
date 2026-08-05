import logging
from sqlalchemy.orm import Session
from app.features.reports.models import Report, CredibilityFactor
from app.features.ai.interfaces import (
    BaseHazardDetectionService,
    BaseEvidenceCollectionService,
    BaseIncidentIntelligenceEngine,
    BaseAlertEngine
)
from app.features.ai.credibility import CredibilityEngine

logger = logging.getLogger("ai.orchestrator")

class AIOrchestrator:
    def __init__(
        self,
        detector: BaseHazardDetectionService,
        evidence_collector: BaseEvidenceCollectionService,
        credibility_engine: CredibilityEngine,
        incident_engine: BaseIncidentIntelligenceEngine,
        alert_engine: BaseAlertEngine
    ) -> None:
        self.detector = detector
        self.evidence_collector = evidence_collector
        self.credibility_engine = credibility_engine
        self.incident_engine = incident_engine
        self.alert_engine = alert_engine

    def process_report(self, db: Session, report_id: str) -> Report:
        """Runs a hazard report through the AI pipeline sequentially, logging every stage."""
        logger.info(f"AI Pipeline: Initializing processing for Report {report_id}")
        
        # 1. Fetch report and verify availability
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            logger.error(f"AI Pipeline Failure: Report {report_id} not found in database.")
            raise ValueError(f"Report {report_id} not found")
            
        try:
            # Stage 1: Mark processing status
            report.report_status = "AI_PROCESSING"
            db.commit()
            db.refresh(report)
            logger.info("AI Pipeline [Stage 1/5]: Status set to AI_PROCESSING")
            
            # Stage 2: Category and type classification
            detect_res = self.detector.detect_hazard(report.image_url, report.description)
            report.hazard_category = detect_res["hazard_category"]
            report.hazard_type = detect_res["hazard_type"]
            report.detection_confidence = detect_res["confidence"]
            
            report.report_status = "UNDER_VERIFICATION"
            db.commit()
            logger.info("AI Pipeline [Stage 2/5]: Hazard detection complete. Status: UNDER_VERIFICATION")
            
            # Stage 3: Telemetry evidence collection
            evidence = self.evidence_collector.collect_evidence(db, report)
            logger.info("AI Pipeline [Stage 3/5]: Telemetry evidence collection complete")
            
            # Stage 4: Strategy-based credibility evaluation
            cred_res = self.credibility_engine.evaluate_credibility(
                report.hazard_category, 
                evidence
            )
            report.credibility_score = cred_res["credibility_score"]
            report.ai_reasoning = cred_res["reasoning"]
            report.verification_status = cred_res["decision"]
            
            # Save credibility factor breakdown entries to DB
            db.query(CredibilityFactor).filter(CredibilityFactor.report_id == report.id).delete()
            
            for factor_desc in cred_res.get("supporting_factors", []):
                cf = CredibilityFactor(
                    report_id=report.id,
                    factor_name=factor_desc,
                    factor_category="universal",
                    factor_score=15.0,
                    weight=1.0,
                    passed=True,
                    reason=factor_desc
                )
                db.add(cf)
                
            for factor_desc in cred_res.get("contradicting_factors", []):
                cf = CredibilityFactor(
                    report_id=report.id,
                    factor_name=factor_desc,
                    factor_category="universal",
                    factor_score=-15.0,
                    weight=1.0,
                    passed=False,
                    reason=factor_desc
                )
                db.add(cf)
                
            db.commit()
            logger.info("AI Pipeline [Stage 4/5]: Credibility factors saved successfully.")
            
            # Stage 5: Group duplicate coordinate records (Incident Fusion)
            incident = self.incident_engine.evaluate_incident(db, report)
            logger.info(f"AI Pipeline [Stage 5/5]: Incident intelligence fusion complete. Centroid: {incident.id}")
            
            # Stage 6: Geofenced alert validations
            alerts = self.alert_engine.evaluate_alerts(db, report, incident)
            if alerts:
                logger.info(f"AI Pipeline Alerting: Dispatched {len(alerts)} database alert records.")
                
            # Complete Pipeline
            db.commit()
            db.refresh(report)
            logger.info(f"AI Pipeline Success: Report {report_id} fully processed. Status: {report.report_status}")
            return report
            
        except Exception as e:
            db.rollback()
            logger.error(f"AI Pipeline Error on Report {report_id}: {e}")
            
            # Safeguard transaction, marking report state as rejected
            try:
                report.report_status = "REJECTED"
                report.ai_reasoning = f"AI Pipeline evaluation crashed: {str(e)}"
                db.add(report)
                db.commit()
            except Exception as inner_err:
                logger.critical(f"Failed to write error recovery status to database: {inner_err}")
                
            raise e
