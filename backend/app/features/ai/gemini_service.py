import os
import json
import logging
from typing import Dict, Any, Optional
from PIL import Image
from sqlalchemy.orm import Session
import google.generativeai as genai
from app.core.config import settings
from app.features.ai.prompts import SYSTEM_PROMPT
from app.features.ai.models import AIAnalysis

logger = logging.getLogger("ai.gemini_service")

class GeminiService:
    def __init__(self) -> None:
        """Initializes Google GenAI config using settings.GEMINI_API_KEY."""
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.configured = True
            except Exception as e:
                logger.error(f"Failed to configure google-generativeai: {e}")
                self.configured = False
        else:
            self.configured = False
            logger.warning("GEMINI_API_KEY is not set in environment or config.")

    def analyze_evidence(
        self, 
        db: Session, 
        report_id: str, 
        image_url: Optional[str], 
        description: Optional[str]
    ) -> Dict[str, Any]:
        """Queries Google Gemini Vision, validates JSON, and stores results in AIAnalysis."""
        if not self.configured:
            raise ValueError("Gemini client is not initialized. GEMINI_API_KEY may be missing.")

        contents = []
        
        # 1. System instruction prompt and description text
        prompt_with_context = (
            f"{SYSTEM_PROMPT}\n"
            f"User Description: {description or 'No description provided'}"
        )
        contents.append(prompt_with_context)

        # 2. Attach local image file if present on disk
        if image_url:
            filename = os.path.basename(image_url)
            local_path = os.path.join(settings.UPLOAD_DIR, filename)
            if os.path.exists(local_path):
                try:
                    img = Image.open(local_path)
                    contents.append(img)
                    logger.info(f"Loaded image from {local_path} for Gemini multimodal query.")
                except Exception as img_err:
                    logger.error(f"Failed to open image at {local_path} for Gemini analysis: {img_err}")
            else:
                logger.warning(f"Image path {local_path} not found on disk. Proceeding with text context only.")

        # 3. Call Google Gemini Vision model using google-generativeai SDK
        model_name = settings.GOOGLE_GENAI_MODEL  # Defaults to gemini-2.5-flash
        logger.info(f"Invoking {model_name} Vision API...")
        
        model = genai.GenerativeModel(model_name=model_name)
        response = model.generate_content(
            contents,
            generation_config={"response_mime_type": "application/json"}
        )

        res_text = response.text.strip()
        data = json.loads(res_text)

        # 4. Validate output JSON structure
        required_keys = ["hazard_category", "hazard_type", "confidence"]
        for key in required_keys:
            if key not in data:
                raise ValueError(f"Gemini response missing required JSON key: {key}")

        # Normalize confidence to 0.0 - 1.0 range
        raw_confidence = float(data["confidence"])
        if raw_confidence > 1.0:
            confidence = raw_confidence / 100.0
        else:
            confidence = raw_confidence

        # 5. Persist the classification results to the AIAnalysis table
        ai_analysis = AIAnalysis(
            report_id=report_id,
            analyzed_description=description,
            hazard_category=str(data["hazard_category"]),
            hazard_type=str(data["hazard_type"]),
            confidence=confidence,
            reasoning=str(data.get("reasoning", "Vision check complete.")),
            severity=str(data.get("severity", "medium")),
            visible_evidence=data.get("visible_evidence", []),
            possible_impacts=data.get("possible_impacts", []),
            recommended_action=str(data.get("recommended_action", ""))
        )
        
        db.add(ai_analysis)
        db.commit()
        db.refresh(ai_analysis)
        logger.info(f"AIAnalysis entry successfully persisted in table for Report {report_id}")

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
