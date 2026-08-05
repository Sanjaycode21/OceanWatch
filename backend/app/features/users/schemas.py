import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "citizen"
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str
    is_active: bool
    
    # Trust statistics parameters
    trust_score: float
    total_reports: int
    verified_reports: int
    rejected_reports: int
    accuracy_rate: float
    
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefreshRequest(BaseModel):
    refresh_token: str
    
class TokenPayload(BaseModel):
    sub: Optional[str] = None
    jti: Optional[str] = None
    type: Optional[str] = None

class UserTrustProfileResponse(BaseModel):
    email: EmailStr
    trust_score: float
    verified_reports: int
    rejected_reports: int
    accuracy_rate: float
    total_reports: int

    class Config:
        from_attributes = True

