from typing import List, Dict
from pydantic import BaseModel

class DashboardSummaryResponse(BaseModel):
    total_reports: int
    total_incidents: int
    confirmed_hazards: int
    pending_verification: int
    critical_incidents: int
    sos_requests: int
    todays_alerts: int

class CategoryCount(BaseModel):
    category: str
    count: int

class StatusCount(BaseModel):
    status: str
    count: int

class PriorityCount(BaseModel):
    priority: str
    count: int

class DailyCount(BaseModel):
    date: str
    count: int

class TrustIntervalCount(BaseModel):
    interval: str  # e.g., 0-20, 21-40
    count: int

class ResponseTimeMetrics(BaseModel):
    average_hours: float
    total_resolved: int

class DashboardAnalyticsResponse(BaseModel):
    incidents_by_category: List[CategoryCount]
    incidents_by_status: List[StatusCount]
    incidents_by_priority: List[PriorityCount]
    reports_per_day: List[DailyCount]
    trust_score_distribution: List[TrustIntervalCount]
    response_time_metrics: ResponseTimeMetrics
