from datetime import datetime, timezone, timedelta
from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.api import deps
from app.features.users.models import User
from app.features.reports.models import Report
from app.features.incidents.models import FusedIncident
from app.features.alerts.models import Alert
from app.features.sos.models import SOSRequest
from app.features.dashboard import schemas

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=schemas.DashboardSummaryResponse)
def read_dashboard_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Calculates overall metrics for the dispatcher command center summary widget."""
    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    
    total_reports = db.query(Report).filter(Report.deleted_at == None).count()
    total_incidents = db.query(FusedIncident).count()
    confirmed_hazards = db.query(FusedIncident).filter(FusedIncident.status == "confirmed").count()
    
    pending_verification = db.query(Report).filter(
        Report.deleted_at == None,
        Report.report_status.in_(["PENDING_AI_ANALYSIS", "AI_PROCESSING", "UNDER_VERIFICATION", "AI_ANALYZED"])
    ).count()
    
    critical_incidents = db.query(FusedIncident).filter(FusedIncident.priority == "critical").count()
    sos_requests = db.query(SOSRequest).filter(SOSRequest.status.in_(["open", "dispatched", "accepted"])).count()
    todays_alerts = db.query(Alert).filter(Alert.sent_at >= today_start).count()
    
    return schemas.DashboardSummaryResponse(
        total_reports=total_reports,
        total_incidents=total_incidents,
        confirmed_hazards=confirmed_hazards,
        pending_verification=pending_verification,
        critical_incidents=critical_incidents,
        sos_requests=sos_requests,
        todays_alerts=todays_alerts
    )

@router.get("/analytics", response_model=schemas.DashboardAnalyticsResponse)
def read_dashboard_analytics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Computes categorical distributions, priority groupings, daily timeline counts, and response speeds."""
    # 1. Incidents by Category (derived by joining with linked reports)
    category_counts = db.query(
        Report.hazard_category.label("category"),
        func.count(FusedIncident.id).label("count")
    ).join(
        Report, Report.incident_id == FusedIncident.id
    ).filter(
        Report.deleted_at == None,
        Report.hazard_category != None
    ).group_by(Report.hazard_category).all()
    
    # 2. Incidents by Status
    status_counts = db.query(
        FusedIncident.status.label("status"),
        func.count(FusedIncident.id).label("count")
    ).group_by(FusedIncident.status).all()
    
    # 3. Incidents by Priority
    priority_counts = db.query(
        FusedIncident.priority.label("priority"),
        func.count(FusedIncident.id).label("count")
    ).group_by(FusedIncident.priority).all()
    
    # 4. Reports Per Day (for the last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    # We use format appropriate for SQLite or Postgres date queries
    db_dialect = db.bind.dialect.name
    if db_dialect == "postgresql":
        date_func = func.to_char(Report.created_at, "YYYY-MM-DD")
    else:
        date_func = func.strftime("%Y-%m-%d", Report.created_at)
        
    daily_reports = db.query(
        date_func.label("date"),
        func.count(Report.id).label("count")
    ).filter(
        Report.created_at >= thirty_days_ago,
        Report.deleted_at == None
    ).group_by(date_func).order_by("date").all()
    
    # 5. Trust Score Distribution of Users
    trust_intervals = db.query(
        case(
            (User.trust_score < 20, "0-20"),
            (User.trust_score < 40, "21-40"),
            (User.trust_score < 60, "41-60"),
            (User.trust_score < 80, "61-80"),
            else_="81-100"
        ).label("interval"),
        func.count(User.id).label("count")
    ).filter(User.role == "citizen").group_by("interval").all()
    
    # 6. Response Time Metrics (Average hours from creation to resolution)
    resolved_incidents = db.query(FusedIncident).filter(
        FusedIncident.status == "resolved",
        FusedIncident.resolved_at != None
    ).all()
    
    total_resolved = len(resolved_incidents)
    avg_hours = 0.0
    if total_resolved > 0:
        total_seconds = sum((inc.resolved_at - inc.created_at).total_seconds() for inc in resolved_incidents)
        avg_hours = (total_seconds / 3600.0) / total_resolved

    return schemas.DashboardAnalyticsResponse(
        incidents_by_category=[schemas.CategoryCount(category=c.category, count=c.count) for c in category_counts],
        incidents_by_status=[schemas.StatusCount(status=s.status, count=s.count) for s in status_counts],
        incidents_by_priority=[schemas.PriorityCount(priority=p.priority, count=p.count) for p in priority_counts],
        reports_per_day=[schemas.DailyCount(date=d.date, count=d.count) for d in daily_reports],
        trust_score_distribution=[schemas.TrustIntervalCount(interval=t.interval, count=t.count) for t in trust_intervals],
        response_time_metrics=schemas.ResponseTimeMetrics(average_hours=avg_hours, total_resolved=total_resolved)
    )
