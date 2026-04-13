from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int    
    

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MeResponse(BaseModel):
    id: str
    name: str
    email: EmailStr