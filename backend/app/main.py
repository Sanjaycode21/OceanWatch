from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.database import Base, engine
from app.api.v1 import api_router
from app.features.system.router import router as health_router

# Initialize global logging parameters
setup_logging()

# Auto-generate database tables dynamically when SQLite fallback is active (for local verification checks)
if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
    from app.features.ai.models import AIAnalysis
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register route prefixes
app.include_router(health_router)
app.include_router(api_router, prefix=settings.API_V1_STR)
