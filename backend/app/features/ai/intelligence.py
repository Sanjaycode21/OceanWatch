import math
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.features.reports.models import Report
from app.features.incidents.models import FusedIncident
from app.features.ai.interfaces import BaseIncidentIntelligenceEngine
from app.core.config import settings

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance in meters between two geocoordinates using the Haversine formula."""
    R = 6371000  # Radius of earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class MockIncidentIntelligenceEngine(BaseIncidentIntelligenceEngine):
    def evaluate_incident(self, db: Session, report: Report) -> FusedIncident:
        """Checks for duplicate reports near coordinates and fuses or creates incidents."""
        # 12-hour spatial-temporal window
        time_limit = datetime.now(timezone.utc) - timedelta(hours=12)
        
        # 1. Search candidate active incidents of the same type in window
        candidates = db.query(FusedIncident).filter(
            FusedIncident.hazard_type == report.hazard_type,
            FusedIncident.created_at >= time_limit,
            FusedIncident.status != "resolved"
        ).all()
        
        matched_incident: Optional[FusedIncident] = None
        
        # Compare proximity within 500m
        for cand in candidates:
            dist = haversine(report.latitude, report.longitude, cand.latitude, cand.longitude)
            if dist <= 500.0:
                matched_incident = cand
                break
                
        if matched_incident:
            # Link report & change status
            report.incident_id = matched_incident.id
            report.report_status = "FUSED"
            
            # Recalculate average coordinates
            linked_reports = db.query(Report).filter(
                Report.incident_id == matched_incident.id,
                Report.deleted_at == None
            ).all()
            
            total_count = len(linked_reports) + 1
            avg_lat = (sum(r.latitude for r in linked_reports) + report.latitude) / total_count
            avg_lon = (sum(r.longitude for r in linked_reports) + report.longitude) / total_count
            
            matched_incident.latitude = avg_lat
            matched_incident.longitude = avg_lon
            
            point_wkt = f"POINT({avg_lon} {avg_lat})"
            if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
                matched_incident.center_geometry = point_wkt
            else:
                matched_incident.center_geometry = func.ST_GeomFromText(point_wkt, 4326)
                
            matched_incident.supporting_reports = total_count
            cred_val = report.credibility_score or 50.0
            matched_incident.incident_confidence = (
                (matched_incident.incident_confidence * (total_count - 1)) + cred_val
            ) / total_count
            
            self._update_incident_states(matched_incident, report.hazard_category)
            db.add(matched_incident)
            db.commit()
            db.refresh(matched_incident)
            return matched_incident
        else:
            # Create a new incident Centroid
            point_wkt = f"POINT({report.longitude} {report.latitude})"
            if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
                location_val = point_wkt
            else:
                location_val = func.ST_GeomFromText(point_wkt, 4326)
                
            new_inc = FusedIncident(
                hazard_type=report.hazard_type,
                latitude=report.latitude,
                longitude=report.longitude,
                center_geometry=location_val,
                radius=100.0,
                incident_confidence=report.credibility_score or 50.0,
                supporting_reports=1,
                status="unverified"
            )
            self._update_incident_states(new_inc, report.hazard_category)
            db.add(new_inc)
            db.commit()
            db.refresh(new_inc)
            
            # Link report
            report.incident_id = new_inc.id
            if report.verification_status == "Verified":
                report.report_status = "VERIFIED"
            else:
                report.report_status = "UNDER_VERIFICATION"
                
            db.add(report)
            db.commit()
            return new_inc

    def _update_incident_states(self, incident: FusedIncident, category: Optional[str]) -> None:
        """Determines incident priority levels and confirmation status dynamically."""
        conf = incident.incident_confidence
        
        # Priority enums
        if category == "Human Emergency":
            incident.priority = "critical"
        elif conf >= 80.0:
            incident.priority = "high"
        elif conf >= 40.0:
            incident.priority = "medium"
        else:
            incident.priority = "low"
            
        # Status enums
        if category == "Human Emergency" or conf >= 75.0 or incident.supporting_reports >= 3:
            incident.status = "confirmed"
        elif conf >= 40.0:
            incident.status = "probable"
        else:
            incident.status = "unverified"
