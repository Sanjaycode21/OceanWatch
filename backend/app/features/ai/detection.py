import os
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.features.reports.models import Report
from app.features.ai.interfaces import BaseHazardDetectionService
from app.features.ai.gemini_service import GeminiService
from app.features.ai.models import AIAnalysis

logger = logging.getLogger("ai.detection")

class MockHazardDetectionService(BaseHazardDetectionService):
    def detect_hazard(self, db: Session, report: Report) -> Dict[str, Any]:
        """Classifies reports using keyword parsing in descriptions as a placeholder for ML models."""
        text = (report.description or "").lower()
        
        if "oil" in text or "spill" in text:
            category = "Pollution"
            h_type = "Oil Spill"
            confidence = 0.95
            reasoning = "[MOCK] Detected oil keyword in description."
        elif "wave" in text or "swell" in text or "tsunami" in text:
            category = "Ocean Weather"
            h_type = "High Waves"
            confidence = 0.92
            reasoning = "[MOCK] Detected wave/swell keyword in description."
        elif "collision" in text or "capsize" in text or "crash" in text:
            category = "Maritime"
            h_type = "Boat Collision"
            confidence = 0.90
            reasoning = "[MOCK] Detected collision keyword in description."
        elif "drown" in text or "swimmer" in text or "sos" in text or "emergency" in text:
            category = "Human Emergency"
            h_type = "Missing Swimmer"
            confidence = 0.98
            reasoning = "[MOCK] Detected emergency keyword in description."
        elif "fish" in text or "coral" in text or "marine" in text:
            category = "Marine Ecosystem"
            h_type = "Dead Marine Life"
            confidence = 0.88
            reasoning = "[MOCK] Detected ecosystem keyword in description."
        else:
            category = "Ocean Weather"
            h_type = "High Waves"
            confidence = 0.70
            reasoning = "[MOCK] Default classification due to no keywords matched."

        # Clear existing analysis if present
        db.query(AIAnalysis).filter(AIAnalysis.report_id == report.id).delete()

        # Save AIAnalysis record to DB
        ai_analysis = AIAnalysis(
            report_id=str(report.id),
            analyzed_description=report.description,
            hazard_category=category,
            hazard_type=h_type,
            confidence=confidence,
            reasoning=reasoning,
            severity="high" if confidence >= 0.90 else "medium",
            visible_evidence=["[MOCK] Automated visual trace indicators", "[MOCK] Coastal line scanning matches"],
            possible_impacts=["[MOCK] Threat to marine habitat zones", "[MOCK] Local navigational danger bounds"],
            recommended_action="Validate coordinates with GIS radar and dispatch responder patrols."
        )
        db.add(ai_analysis)
        db.commit()
        db.refresh(ai_analysis)

        return {
            "hazard_category": ai_analysis.hazard_category,
            "hazard_type": ai_analysis.hazard_type,
            "confidence": ai_analysis.confidence,
            "reasoning": ai_analysis.reasoning,
            "severity": ai_analysis.severity,
            "visible_evidence": ai_analysis.visible_evidence,
            "possible_impacts": ai_analysis.possible_impacts,
            "recommended_action": ai_analysis.recommended_action
        }

class GeminiHazardDetectionService(BaseHazardDetectionService):
    def __init__(self) -> None:
        """Initializes the decoupled Gemini Vision client service wrapper."""
        self.gemini_service = GeminiService()

    def detect_hazard(self, db: Session, report: Report) -> Dict[str, Any]:
        """Classifies ocean hazards using Google Gemini Vision. Falls back to Mock if keys are missing."""
        # Check for simulated preset images first for fast E2E prototype simulation
        if report.image_url:
            filename = os.path.basename(report.image_url).lower()
            simulated_data = None
            if "oil_spill" in filename:
                simulated_data = {
                    "hazard_category": "Pollution",
                    "hazard_type": "Oil Spill",
                    "confidence": 0.96,
                    "reasoning": "[SIMULATED PRESET] Vision analysis detects a dark, viscous surface sheen spreading across the coastal waters, characteristic of an oil slick.",
                    "severity": "critical",
                    "visible_evidence": ["frothy slick boundary", "rainbow colored sheen", "dark viscous surface patch"],
                    "possible_impacts": ["seabird feather contamination", "destruction of local intertidal ecosystems", "coastal fishery closure"],
                    "recommended_action": "Deploy containment booms, apply marine dispersants if approved, and notify coast guard emergency responders."
                }
            elif "coral_bleaching" in filename:
                simulated_data = {
                    "hazard_category": "Marine Ecosystem",
                    "hazard_type": "Coral Bleaching",
                    "confidence": 0.92,
                    "reasoning": "[SIMULATED PRESET] Subsurface images display widespread loss of symbiotic zooxanthellae in hard corals, causing skeletal structures to appear stark white.",
                    "severity": "high",
                    "visible_evidence": ["skeletal white coral structures", "algal overgrowth on dead coral", "elevated sea temperature readings"],
                    "possible_impacts": ["loss of marine nursery habitats", "reduction in reef structural integrity", "decline in local fish populations"],
                    "recommended_action": "Implement thermal stress monitoring protocols, restrict local diving activities, and study reef resilience parameters."
                }
            elif "plastic_pollution" in filename:
                simulated_data = {
                    "hazard_category": "Pollution",
                    "hazard_type": "Plastic Pollution",
                    "confidence": 0.98,
                    "reasoning": "[SIMULATED PRESET] High density of floating synthetic debris, marine plastic bottles, and discarded nets detected accumulating along the shoreline.",
                    "severity": "medium",
                    "visible_evidence": ["macro-plastic debris", "floating ghost nets", "micro-plastic accumulation zones"],
                    "possible_impacts": ["entanglement of marine mammals", "ingestion of micro-plastics by fish", "beach degradation"],
                    "recommended_action": "Organize shoreline recovery sweeps, deploy floating trash interception barriers, and institute local waste regulations."
                }
            elif "algal_bloom" in filename:
                simulated_data = {
                    "hazard_category": "Pollution",
                    "hazard_type": "Algal Bloom",
                    "confidence": 0.94,
                    "reasoning": "[SIMULATED PRESET] Aerial imagery shows a thick, bright green chlorophyll-a plume extending across the bay, consistent with a harmful algal bloom.",
                    "severity": "high",
                    "visible_evidence": ["green/red water discoloration", "dead fish wash-ups", "high chlorophyll-a concentration"],
                    "possible_impacts": ["marine neurotoxin release", "anoxic dead zone creation", "shellfish toxicity risk"],
                    "recommended_action": "Issue public safety warnings, restrict commercial and recreational shellfishing, and track plume dispersal patterns."
                }

            if simulated_data:
                logger.info(f"Simulating hazard detection for preset image: {filename}")
                # Clear existing analysis if present
                db.query(AIAnalysis).filter(AIAnalysis.report_id == report.id).delete()
                # Save to DB
                ai_analysis = AIAnalysis(
                    report_id=str(report.id),
                    analyzed_description=report.description,
                    hazard_category=simulated_data["hazard_category"],
                    hazard_type=simulated_data["hazard_type"],
                    confidence=simulated_data["confidence"],
                    reasoning=simulated_data["reasoning"],
                    severity=simulated_data["severity"],
                    visible_evidence=simulated_data["visible_evidence"],
                    possible_impacts=simulated_data["possible_impacts"],
                    recommended_action=simulated_data["recommended_action"]
                )
                db.add(ai_analysis)
                db.commit()
                db.refresh(ai_analysis)
                return simulated_data

        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured. Falling back to Mock Classifier.")
            return MockHazardDetectionService().detect_hazard(db, report)

        try:
            # Delegate directly to our decoupled Gemini Service class
            analysis = self.gemini_service.analyze_evidence(
                db=db,
                report_id=str(report.id),
                image_url=report.image_url,
                description=report.description
            )
            
            # Rewrite classification if confidence score falls below strict limit (40%)
            confidence = float(analysis.get("confidence", 0.5))
            if confidence < 0.40:
                logger.info(f"Low confidence classification ({confidence}). Reclassifying to Unknown.")
                ai_analysis = db.query(AIAnalysis).filter(AIAnalysis.report_id == report.id).first()
                if ai_analysis:
                    ai_analysis.hazard_category = "Ocean Weather"
                    ai_analysis.hazard_type = "Unknown Hazard"
                    ai_analysis.confidence = confidence
                    ai_analysis.reasoning = "Low classification confidence."
                    db.commit()
                    db.refresh(ai_analysis)
                return {
                    "hazard_category": "Ocean Weather",
                    "hazard_type": "Unknown Hazard",
                    "confidence": confidence,
                    "reasoning": analysis.get("reasoning", "Low classification confidence."),
                    "severity": analysis.get("severity", "medium"),
                    "visible_evidence": analysis.get("visible_evidence", []),
                    "possible_impacts": analysis.get("possible_impacts", []),
                    "recommended_action": analysis.get("recommended_action", "")
                }

            return analysis

        except Exception as e:
            logger.error(f"Gemini Vision Pipeline Exception: {e}. Falling back to Mock service.")
            return MockHazardDetectionService().detect_hazard(db, report)

