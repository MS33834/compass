from fastapi import APIRouter, Body, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import timedelta
from uuid import UUID
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, UserUpdate
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.utils import generate_uuid
from app.config import settings
from app.dependencies import get_current_user
from app.core.ratelimit import limiter, AUTH_LIMIT


router = APIRouter()


class AccountDeleteRequest(BaseModel):
    password: Optional[str] = None


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit(AUTH_LIMIT)
async def register(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # We deliberately do NOT distinguish between "email already registered"
    # and "username already taken" in the response. The same generic detail
    # is returned in both cases so that an attacker cannot use the register
    # endpoint to enumerate which emails / usernames already have accounts.
    # The frontend does its own pre-flight uniqueness checks against the
    # /auth/check-* helpers (when available) for user experience, but those
    # are not security boundaries.
    email_taken = (
        db.query(User).filter(User.email == user_data.email).first() is not None
    )
    username_taken = (
        db.query(User).filter(User.username == user_data.username).first() is not None
    )
    if email_taken or username_taken:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create account with the provided details",
        )

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        is_guest=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user.id)},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user": new_user}


@router.post("/login", response_model=Token)
@limiter.limit(AUTH_LIMIT)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        # Generic message: do not leak that the account exists but is disabled.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/guest", response_model=Token)
@limiter.limit(AUTH_LIMIT)
async def guest_login(
    request: Request,
    db: Session = Depends(get_db)
):
    guest_id = generate_uuid()
    # The .example TLD is reserved by RFC 2606 and Pydantic's EmailStr
    # validator accepts it; .local is rejected as a special-use name.
    guest_email = f"guest_{guest_id}@guest.mindmirror.example"

    guest_user = User(
        email=guest_email,
        username=f"guest_{guest_id[:8]}",
        hashed_password=get_password_hash("guest_temporary_password"),
        is_guest=True
    )
    db.add(guest_user)
    db.commit()
    db.refresh(guest_user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(guest_user.id)},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user": guest_user}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Same anti-enumeration policy as /register: when updating profile
    # fields to a value that is taken, the response is intentionally generic.
    if payload.username and payload.username != current_user.username:
        if db.query(User).filter(User.username == payload.username).first() is not None:
            raise HTTPException(
                status_code=400,
                detail="Could not update profile with the provided details",
            )
        current_user.username = payload.username
    if payload.email and payload.email != current_user.email:
        if db.query(User).filter(User.email == payload.email).first() is not None:
            raise HTTPException(
                status_code=400,
                detail="Could not update profile with the provided details",
            )
        current_user.email = payload.email
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    return {"message": "Successfully logged out"}


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit(AUTH_LIMIT)
async def delete_account(
    request: Request,
    payload: AccountDeleteRequest = Body(default_factory=AccountDeleteRequest),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_guest:
        if not payload.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password confirmation required to delete account"
            )
        if not verify_password(payload.password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password"
            )
    db.delete(current_user)
    db.commit()
    return None
