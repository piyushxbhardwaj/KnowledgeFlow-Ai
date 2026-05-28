from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.core.logging import log_activity
from app.models.user import User
from app.schemas.user import UserLogin, Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        log_activity(
            db, 
            user_id=None, 
            action="Login", 
            details=f"Failed login attempt for email: {login_data.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    log_activity(
        db, 
        user_id=user.id, 
        action="Login", 
        details=f"User {user.username} logged in successfully."
    )
    
    access_token = create_access_token(subject=user.id, role=user.role.name)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
