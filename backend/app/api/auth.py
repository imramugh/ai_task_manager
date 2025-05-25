from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.schemas.user import (
    UserCreate, User, Token, 
    PasswordResetRequest, PasswordResetConfirm, PasswordResetResponse
)
from app.models.user import User as UserModel
from app.services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
    create_password_reset_token,
    verify_password_reset_token
)
from app.services.email import email_service
from app.config import settings
import logging

# Issue #18: Import rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

@router.post("/register", response_model=User)
@limiter.limit("5/minute")  # Issue #18: Add rate limiting to prevent abuse
async def register(
    request: Request,
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # Check if user already exists
    db_user = db.query(UserModel).filter(
        UserModel.email == user.email
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")  # Issue #18: Strict rate limiting for login to prevent brute force
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Authenticate user
    user = db.query(UserModel).filter(
        UserModel.email == form_data.username
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=User)
@limiter.limit("60/minute")  # Issue #18: Add rate limiting
async def get_current_user_info(
    request: Request,
    current_user: UserModel = Depends(get_current_user)
):
    return current_user

@router.post("/password-reset/request", response_model=PasswordResetResponse)
@limiter.limit("3/hour")  # Strict rate limiting to prevent abuse
async def request_password_reset(
    request: Request,
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request a password reset email."""
    # Find user by email
    user = db.query(UserModel).filter(
        UserModel.email == reset_request.email
    ).first()
    
    # Always return success to prevent email enumeration
    response_message = "If an account exists with this email, a password reset link has been sent."
    
    if user:
        # Generate reset token
        token = create_password_reset_token(user, db)
        
        # Create reset URL
        reset_url = f"{settings.frontend_url}/reset-password?token={token}"
        
        # Send email
        try:
            email_sent = email_service.send_password_reset_email(
                to_email=user.email,
                reset_url=reset_url
            )
            if not email_sent:
                logger.error(f"Failed to send password reset email to {user.email}")
        except Exception as e:
            logger.error(f"Error sending password reset email: {str(e)}")
    
    return {"message": response_message}

@router.post("/password-reset/confirm", response_model=PasswordResetResponse)
@limiter.limit("5/hour")  # Rate limiting to prevent brute force
async def confirm_password_reset(
    request: Request,
    reset_confirm: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Confirm password reset with token and new password."""
    # Verify the token
    user = verify_password_reset_token(reset_confirm.token, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user.hashed_password = get_password_hash(reset_confirm.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    
    db.commit()
    
    return {"message": "Password has been reset successfully"}

@router.get("/password-reset/verify/{token}")
@limiter.limit("10/hour")
async def verify_reset_token(
    request: Request,
    token: str,
    db: Session = Depends(get_db)
):
    """Verify if a password reset token is valid."""
    user = verify_password_reset_token(token, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {"valid": True, "email": user.email}
