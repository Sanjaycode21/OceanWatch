from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.api import deps
from app.features.users.models import User
from app.features.reports.models import Report, CredibilityFactor
from app.features.incidents.models import FusedIncident
from app.features.incidents import schemas

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("/", response_model=List[schemas.FusedIncidentResponse])
def read_incidents(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    hazard_category: Optional[str] = None,
    hazard_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Retrieves paginated incidents using search keywords and status/priority/date-range filtering. Restricted to authorities."""
    query = db.query(FusedIncident)
    
    # Keyword search on summary notes
    if search:
        query = query.filter(FusedIncident.summary.ilike(f"%{search}%"))
        
    # Category and type filters
    if hazard_type:
        query = query.filter(FusedIncident.hazard_type == hazard_type)
    if status_filter:
        query = query.filter(FusedIncident.status == status_filter)
    if priority:
        query = query.filter(FusedIncident.priority == priority)
        
    # Date Range filtering
    if start_date:
        query = query.filter(FusedIncident.created_at >= start_date)
    if end_date:
        query = query.filter(FusedIncident.created_at <= end_date)
        
    # Sorting
    sort_column = getattr(FusedIncident, sort_by, FusedIncident.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
        
    return query.offset(skip).limit(limit).all()

@router.get("/{incident_id}", response_model=schemas.FusedIncidentDetailResponse)
def read_incident(
    incident_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Retrieves full details for an incident centroid (linked reports, alerts history, and explainable AI reasons)."""
    incident = db.query(FusedIncident).filter(FusedIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
        
    reports = db.query(Report).filter(Report.incident_id == incident.id, Report.deleted_at == None).all()
    
    supporting = []
    contradicting = []
    reasoning_parts = []
    
    for r in reports:
        if r.ai_reasoning:
            reasoning_parts.append(r.ai_reasoning)
        factors = db.query(CredibilityFactor).filter(CredibilityFactor.report_id == r.id).all()
        for f in factors:
            if f.passed:
                supporting.append(f.factor_name)
            else:
                contradicting.append(f.factor_name)
                
    ai_reasoning = "; ".join(set(reasoning_parts)) if reasoning_parts else "No AI reasoning logged yet."
    
    return schemas.FusedIncidentDetailResponse(
        id=incident.id,
        hazard_type=incident.hazard_type,
        latitude=incident.latitude,
        longitude=incident.longitude,
        incident_confidence=incident.incident_confidence,
        priority=incident.priority,
        status=incident.status,
        supporting_reports=incident.supporting_reports,
        assigned_team=incident.assigned_team,
        resolution_notes=incident.resolution_notes,
        created_at=incident.created_at,
        updated_at=incident.updated_at,
        resolved_at=incident.resolved_at,
        reports=reports,
        alerts=incident.alerts,
        supporting_factors=list(set(supporting)),
        contradicting_factors=list(set(contradicting)),
        ai_reasoning=ai_reasoning
    )

@router.patch("/{incident_id}", response_model=schemas.FusedIncidentResponse)
def patch_incident(
    incident_id: str,
    incident_in: schemas.FusedIncidentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Enables dispatches to assign rescue teams and modify priority/status. Sets resolved_at on resolve."""
    incident = db.query(FusedIncident).filter(FusedIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
        
    update_data = incident_in.model_dump(exclude_unset=True)
    
    # Auto-resolve time
    if update_data.get("status") == "resolved":
        incident.resolved_at = datetime.now(timezone.utc)
        
    for field in update_data:
        setattr(incident, field, update_data[field])
        
    incident.updated_at = datetime.now(timezone.utc)
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Broadcast to SSE
    from app.core.events import publisher
    publisher.broadcast_sync("incident_updated", {
        "id": str(incident.id),
        "hazard_type": incident.hazard_type,
        "priority": incident.priority,
        "status": incident.status,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "updated_at": incident.updated_at.isoformat()
    })

    return incident

@router.get("/{incident_id}/evidence", response_model=schemas.IncidentEvidenceResponse)
def read_incident_evidence(
    incident_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Retrieves aggregated credibility factors, AI reasoning, and factor scores for the incident."""
    incident = db.query(FusedIncident).filter(FusedIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
        
    reports = db.query(Report).filter(Report.incident_id == incident.id, Report.deleted_at == None).all()
    
    supporting = []
    contradicting = []
    reasoning_parts = []
    breakdown = []
    
    for r in reports:
        if r.ai_reasoning:
            reasoning_parts.append(r.ai_reasoning)
        factors = db.query(CredibilityFactor).filter(CredibilityFactor.report_id == r.id).all()
        for f in factors:
            if f.passed:
                supporting.append(f.factor_name)
            else:
                contradicting.append(f.factor_name)
            breakdown.append({
                "factor_name": f.factor_name,
                "score": f.factor_score,
                "passed": f.passed,
                "reason": f.reason
            })
            
    ai_reasoning = "; ".join(set(reasoning_parts)) if reasoning_parts else "No AI reasoning logged."
    
    return schemas.IncidentEvidenceResponse(
        supporting_factors=list(set(supporting)),
        contradicting_factors=list(set(contradicting)),
        ai_reasoning=ai_reasoning,
        incident_confidence=incident.incident_confidence,
        credibility_breakdown=breakdown
    )
