from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["system"])
def health_check() -> dict:
    """Verifies that the server is operational and responding."""
    return {
        "status": "healthy",
        "service": "OceanWatch AI Backend",
        "version": "1.0.0"
    }
