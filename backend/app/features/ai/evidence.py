from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.features.reports.models import Report
from app.features.users.models import User
from app.features.ai.interfaces import BaseEvidenceCollectionService

class MockEvidenceCollectionService(BaseEvidenceCollectionService):
    def collect_evidence(self, db: Session, report: Report) -> Dict[str, Any]:
        """Gathers environmental, user trust, and neighboring report telemetry."""
        # 1. Fetch reporter trust score
        trust_score = 50.0  # Default for anonymous uploads
        if report.user_id:
            user = db.query(User).filter(User.id == report.user_id).first()
            if user:
                trust_score = user.trust_score
                
        # 2. Count nearby reports of the same hazard type (~5km bounding box for dialiect-agnostic check)
        nearby_count = db.query(Report).filter(
            Report.id != report.id,
            Report.deleted_at == None,
            Report.hazard_type == report.hazard_type,
            Report.latitude >= report.latitude - 0.05,
            Report.latitude <= report.latitude + 0.05,
            Report.longitude >= report.longitude - 0.05,
            Report.longitude <= report.longitude + 0.05
        ).count()
        
        # 3. Check media attachment indicators
        has_image = bool(report.image_url)
        has_video = bool(report.video_url)
        
        # 4. Check timestamp sanity
        time_diff = (datetime.now(timezone.utc) - report.timestamp.replace(tzinfo=timezone.utc)).total_seconds()
        is_recent = time_diff < (24 * 3600)  # within 24 hours
        
        return {
            "reporter_trust": trust_score,
            "nearby_reports_count": nearby_count,
            "has_image": has_image,
            "has_video": has_video,
            "is_recent_timestamp": is_recent,
            "exif_gps_match": True,
            "weather_telemetry_match": True
        }
