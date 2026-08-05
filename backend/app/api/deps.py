from typing import Generator, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.storage import BaseStorageService, LocalStorageService
from app.features.users import crud, models, schemas

# Setup OAuth2 schemes. Disable auto-error on the optional router to support anonymous uploads.
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

reusable_oauth2_mandatory = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db() -> Generator[Session, None, None]:
    """Generates database sessions and handles cleanups."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user_optional(
    token: Optional[str] = Depends(reusable_oauth2),
    db: Session = Depends(get_db)
) -> Optional[str]:
    """Retrieves the current user ID if a valid JWT access token is present, else returns None."""
    if not token:
        return None
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
        if token_data.sub is None or token_data.type != "access":
            return None
    except JWTError:
        return None
        
    user = crud.get_user_by_id(db, user_id=token_data.sub)
    if not user or not user.is_active:
        return None
    return str(user.id)

def get_current_user(
    token: str = Depends(reusable_oauth2_mandatory),
    db: Session = Depends(get_db)
) -> models.User:
    """Forces JWT validation and retrieves user record. Raises HTTP 401 on failure."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
        if token_data.sub is None or token_data.type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = crud.get_user_by_id(db, user_id=token_data.sub)
    if not user:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user account"
        )
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Dependency that asserts the authenticated user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

class RoleChecker:
    """FastAPI dependency to restrict API access based on user role permissions."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(
        self, 
        current_user: models.User = Depends(get_current_active_user)
    ) -> models.User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Insufficient permissions."
            )
        return current_user

def get_current_user_role(
    current_user: models.User = Depends(get_current_user)
) -> str:
    """Retrieves the security role for the current logged-in user."""
    return current_user.role

def get_storage_service() -> BaseStorageService:
    """Returns the active storage service driver."""
    return LocalStorageService()

def get_ai_orchestrator() -> "AIOrchestrator":
    """Instantiates the AI Orchestrator injecting target sub-service drivers."""
    from app.features.ai import (
        MockEvidenceCollectionService,
        CredibilityEngine,
        MockIncidentIntelligenceEngine,
        MockAlertEngine,
        AIOrchestrator
    )
    from app.features.ai.detection import GeminiHazardDetectionService
    from app.features.alerts.sms_provider import MockSMSProvider
    
    sms_provider = MockSMSProvider()
    
    return AIOrchestrator(
        detector=GeminiHazardDetectionService(),
        evidence_collector=MockEvidenceCollectionService(),
        credibility_engine=CredibilityEngine(),
        incident_engine=MockIncidentIntelligenceEngine(),
        alert_engine=MockAlertEngine(sms_provider=sms_provider)
    )

