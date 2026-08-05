from fastapi import APIRouter
from app.features.users.router import router as auth_router, trust_router
from app.features.reports.router import router as reports_router
from app.features.incidents.router import router as incidents_router
from app.features.alerts.router import router as alerts_router
from app.features.sos.router import router as sos_router
from app.features.dashboard.router import router as dashboard_router
from app.features.map.router import router as map_router
from app.features.events.router import router as events_router

api_router = APIRouter()

# Aggregate routers from feature slices
api_router.include_router(auth_router)
api_router.include_router(trust_router)
api_router.include_router(reports_router)
api_router.include_router(incidents_router)
api_router.include_router(alerts_router)
api_router.include_router(sos_router)
api_router.include_router(dashboard_router)
api_router.include_router(map_router)
api_router.include_router(events_router)
