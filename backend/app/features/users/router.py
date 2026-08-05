from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core.security import verify_password, create_access_token
from app.features.users import crud, schemas, models

router = APIRouter(prefix="/auth", tags=["auth"])
trust_router = APIRouter(tags=["users"])

@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    """Registers a new user profile. Validates email and phone uniqueness."""
    db_user = crud.get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    
    if user_in.phone:
        db_phone = crud.get_user_by_phone(db, phone=user_in.phone)
        if db_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this phone number already exists in the system."
            )
            
    return crud.create_user(db, obj_in=user_in)

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db)
):
    """Verifies credentials, registers a session token in the database, and returns credentials."""
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Issue access token and store a secure refresh token database record
    access_token = create_access_token(subject=user.id)
    refresh_token_obj = crud.create_refresh_token(db, user_id=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_obj.token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(
    payload: schemas.TokenRefreshRequest,
    db: Session = Depends(deps.get_db)
):
    """Accepts a refresh token, rotates session keys, and yields new credentials. Terminate sessions on breach."""
    db_token = crud.get_refresh_token(db, token=payload.refresh_token)
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Replay attack protection: if a token has already been marked as revoked, terminate all user active sessions
    if db_token.is_revoked:
        crud.revoke_all_user_refresh_tokens(db, user_id=db_token.user_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token already used. Security alert: Terminating all active sessions."
        )
        
    # Verify expiration
    current_time = datetime.now(timezone.utc)
    # Ensure timezone awareness matches
    expiry_time = db_token.expires_at.replace(tzinfo=timezone.utc) if db_token.expires_at.tzinfo is None else db_token.expires_at
    if expiry_time < current_time:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired refresh token"
        )
        
    # Revoke current token (rotation)
    crud.revoke_refresh_token(db, db_token=db_token)
    
    # Generate rotated credentials pair
    new_access_token = create_access_token(subject=db_token.user_id)
    new_refresh_token_obj = crud.create_refresh_token(db, user_id=db_token.user_id)
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token_obj.token,
        "token_type": "bearer"
    }

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    payload: schemas.TokenRefreshRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """Invalidates the user's refresh token record, logging out that device session."""
    db_token = crud.get_refresh_token(db, token=payload.refresh_token)
    if not db_token or db_token.user_id != current_user.id:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token context"
         )
         
    crud.revoke_refresh_token(db, db_token=db_token)
    return

@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """Retrieves profile attributes for the currently logged-in user."""
    return current_user

@trust_router.get("/users/trust", response_model=List[schemas.UserTrustProfileResponse])
def read_users_trust(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.RoleChecker(["authority", "admin"]))
):
    """Retrieves a list of citizen user trust ratings and verification stats. Restricted to authorities."""
    return db.query(models.User).filter(models.User.role == "citizen").offset(skip).limit(limit).all()
