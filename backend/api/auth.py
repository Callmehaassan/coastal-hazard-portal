"""
Auth routes. Hashing/JWT/RBAC logic lives in services/auth_service.py -
this file only handles HTTP request/response concerns.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from config import get_settings
from database import get_db
from models.user import User, UserRole
from schemas.user import LoginRequest, TokenResponse, UserCreate, UserOut
from services.auth_service import (
    ACCESS_COOKIE_NAME,
    create_access_token,
    get_current_user,
    hash_password,
    require_role,
    verify_password,
)

# Re-exported so existing `from api.auth import get_current_user, require_role`
# imports elsewhere in the codebase keep working unchanged.
__all__ = ["router", "get_current_user", "require_role"]

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if user is None or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    token = create_access_token(user)
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.environment != "development",
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
    )
    return TokenResponse(access_token=token)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.ADMIN)),
):
    """Admin-only: creates Viewer/Analyst/Admin accounts (FR-8)."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(email=payload.email, hashed_password=hash_password(payload.password), role=payload.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    """Returns the currently logged-in user, based on the access_token cookie."""
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(ACCESS_COOKIE_NAME)
    return {"detail": "Logged out"}
