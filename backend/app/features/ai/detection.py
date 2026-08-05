import os
import json
import logging
from typing import Dict, Any, Optional
from PIL import Image
import google.generativeai as genai
from app.core.config import settings
from app.features.ai.interfaces import BaseHazardDetectionService

logger = logging.getLogger("ai.detection")

class MockHazardDetectionService(BaseHazardDetectionService):
    def detect_hazard(self, image_url: Optional[str], description: Optional[str]) -> Dict[str, Any]:
        """Classifies reports using keyword parsing in descriptions as a placeholder for ML models."""
        text = (description or "").lower()
        
        if "oil" in text or "spill" in text:
            return {
                "hazard_category": "Pollution",
                "hazard_type": "Oil Spill",
                "confidence": 0.95
            }
        elif "wave" in text or "swell" in text or "tsunami" in text:
            return {
                "hazard_category": "Ocean Weather",
                "hazard_type": "High Waves",
                "confidence": 0.92
            }
        elif "collision" in text or "capsize" in text or "crash" in text:
            return {
                "hazard_category": "Maritime",
                "hazard_type": "Boat Collision",
                "confidence": 0.90
            }
        elif "drown" in text or "swimmer" in text or "sos" in text or "emergency" in text:
            return {
                "hazard_category": "Human Emergency",
                "hazard_type": "Missing Swimmer",
                "confidence": 0.98
            }
        elif "fish" in text or "coral" in text:
            return {
                "hazard_category": "Marine Ecosystem",
                "hazard_type": "Fish Kill",
                "confidence": 0.88
            }
        else:
            return {
                "hazard_category": "Ocean Weather",
                "hazard_type": "High Waves",
                "confidence": 0.70
            }

class GeminiHazardDetectionService(BaseHazardDetectionService):
    def __init__(self) -> None:
        """Configures the Gemini Vision SDK if settings key is provided."""
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)

    def detect_hazard(self, image_url: Optional[str], description: Optional[str]) -> Dict[str, Any]:
        """Classifies ocean hazards using Google Gemini Vision, analyzing images and descriptions."""
        # 1. Fallback to mock service if API key is not configured
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured. Falling back to Mock Classifier.")
            return MockHazardDetectionService().detect_hazard(image_url, description)

        try:
            contents = []
            
            # Enforce JSON formatting instructions
            system_prompt = (
                "You are an Ocean Hazard Expert AI. Analyze the provided ocean image and user description. "
                "Respond ONLY with a valid JSON document (no markdown boxes, no other text) containing exactly the following keys:\n"
                "{\n"
                "  \"hazard_category\": \"<one of: Ocean Weather, Pollution, Maritime, Marine Ecosystem, Navigation, Illegal Activities, Human Emergency>\",\n"
                "  \"hazard_type\": \"<specific type name, e.g., Oil Spill, Algal Bloom, Red Tide, High Waves, Debris, Boat Collision>\",\n"
                "  \"confidence\": <float between 0.0 and 1.0 representing classification assurance>,\n"
                "  \"reasoning\": \"<detailed analysis reasoning summarizing visual evidence observed>\"\n"
                "}\n\n"
                f"User description: {description or 'No description provided'}"
            )
            contents.append(system_prompt)

            # 2. Attach local image file if present on disk
            if image_url:
                filename = os.path.basename(image_url)
                local_path = os.path.join(settings.UPLOAD_DIR, filename)
                if os.path.exists(local_path):
                    try:
                        img = Image.open(local_path)
                        contents.append(img)
                    except Exception as img_err:
                        logger.error(f"Gemini Vision Image Load Error at {local_path}: {img_err}")

            # 3. Request multimodal classification from Gemini
            model = genai.GenerativeModel(settings.GOOGLE_GENAI_MODEL)
            response = model.generate_content(
                contents,
                generation_config={"response_mime_type": "application/json"}
            )
            
            res_text = response.text.strip()
            data = json.loads(res_text)

            # 4. Check confidence boundaries and rewrite to Unknown Hazard if low
            confidence = float(data.get("confidence", 0.5))
            if confidence < 0.40:
                return {
                    "hazard_category": "Ocean Weather",
                    "hazard_type": "Unknown Hazard",
                    "confidence": confidence,
                    "reasoning": data.get("reasoning", "Low classification confidence. Hazard flagged as Unknown.")
                }

            return {
                "hazard_category": data.get("hazard_category", "Ocean Weather"),
                "hazard_type": data.get("hazard_type", "High Waves"),
                "confidence": confidence,
                "reasoning": data.get("reasoning", "AI Vision check complete.")
            }

        except Exception as e:
            logger.error(f"Gemini Vision Pipeline Exception: {e}. Falling back to Mock.")
            return MockHazardDetectionService().detect_hazard(image_url, description)
