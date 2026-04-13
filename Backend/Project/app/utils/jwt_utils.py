from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt  
from fastapi import HTTPException, status
from app.core.config import settings


def create_access_token(
    subject: str | int,
    additional_claims: Optional[Dict[str, Any]] = None,
    expires_minutes: Optional[int] = None,
) -> str:
    if expires_minutes is None:
        expires_minutes = settings.JWT_EXPIRES_IN_MINUTES

    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=expires_minutes)

    payload: Dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    if additional_claims:
        payload.update(additional_claims)

    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token


def decode_token(token: str) -> Dict[str, Any]:
    try:
        decoded = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_signature": True, "verify_exp": True},
        )
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )