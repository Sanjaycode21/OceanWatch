from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, generate_refresh_token_string
from app.core.config import settings
from app.features.users.models import User, RefreshToken
from app.features.users.schemas import UserCreate

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieves a user profile by their email address."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone: str) -> Optional[User]:
    """Retrieves a user profile by their phone number."""
    return db.query(User).filter(User.phone == phone).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Retrieves a user profile by their unique ID."""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, obj_in: UserCreate) -> User:
    """Hashes user password and inserts a new user record into the database."""
    db_obj = User(
        email=obj_in.email,
        phone=obj_in.phone,
        hashed_password=get_password_hash(obj_in.password),
        full_name=obj_in.full_name,
        role=obj_in.role,
        is_active=obj_in.is_active,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# Refresh Token Database Helpers
def create_refresh_token(db: Session, user_id: str) -> RefreshToken:
    """Generates and stores a new secure refresh token for the user."""
    token_str = generate_refresh_token_string()
    expiry = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    db_obj = RefreshToken(
        user_id=user_id,
        token=token_str,
        expires_at=expiry,
        is_revoked=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    """Retrieves refresh token details from database."""
    return db.query(RefreshToken).filter(RefreshToken.token == token).first()

def revoke_refresh_token(db: Session, db_token: RefreshToken) -> RefreshToken:
    """Marks a single refresh token as revoked."""
    db_token.is_revoked = True
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

def revoke_all_user_refresh_tokens(db: Session, user_id: str) -> None:
    """Revokes all active refresh tokens associated with a specific user."""
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id, 
        RefreshToken.is_revoked == False
    ).update({"is_revoked": True})
    db.commit()
