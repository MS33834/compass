from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from urllib.parse import urlparse


# Anything outside http(s) is either a stored-XSS vector (javascript:) or
# a privacy/probing one (data:, file:). Keep this list short on purpose.
_SAFE_URL_SCHEMES = frozenset({"http", "https"})


def _validate_safe_url(value: Optional[str]) -> Optional[str]:
    if value is None or value == "":
        return value
    try:
        parsed = urlparse(value)
    except ValueError as exc:
        raise ValueError("avatar_url is not a valid URL") from exc
    if parsed.scheme.lower() not in _SAFE_URL_SCHEMES:
        raise ValueError(f"avatar_url must use http or https, got {parsed.scheme!r}")
    if not parsed.netloc:
        raise ValueError("avatar_url is missing a host")
    return value


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = Field(None, max_length=500)

    @field_validator("avatar_url")
    @classmethod
    def _check_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        return _validate_safe_url(v)


class UserResponse(UserBase):
    id: UUID
    avatar_url: Optional[str] = None
    is_guest: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[str] = None
