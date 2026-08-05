import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
from jose import jwt
from app.core.config import settings

import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies that a plain text password matches its hashed form using bcrypt."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hashes a plain text password using bcrypt."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None,
    jti: Optional[str] = None
) -> str:
    """Generates a secure JWT access token containing subject, expiry, and unique JWT ID."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    token_jti = jti or str(uuid.uuid4())
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "jti": token_jti,
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def generate_refresh_token_string() -> str:
    """Generates a secure random hex string for database-backed refresh tokens."""
    return secrets.token_hex(32)
