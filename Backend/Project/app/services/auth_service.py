from __future__ import annotations
from typing import Any, Dict, Optional

from app.repositories.user_repository import (
    get_user_by_email_raw,
    get_user_by_id_raw,
    create_user_raw,
    DuplicateEmailError,
)

from app.utils.password_utils import hash_password, verify_password
from app.utils.jwt_utils import create_access_token
from app.models.user_model import serialize_user, normalize_email
from app.core.config import settings


class InvalidCredentialsError(Exception):
    pass


class AuthService:
    @staticmethod
    async def signup(name: str, email: str, password: str) -> Dict[str, Any]:
        email = normalize_email(email)
        existing = await get_user_by_email_raw(email)
        if existing:
            raise DuplicateEmailError("Email already registered")

        pwd_hash = hash_password(password)

        try:
            created_doc = await create_user_raw(
                name=name,
                email=email,
                password_hash=pwd_hash
            )
        except DuplicateEmailError:
            raise DuplicateEmailError("Email already registered")

        return serialize_user(created_doc)

    @staticmethod
    async def login(email: str, password: str) -> Dict[str, str]:
        email = normalize_email(email)
        user = await get_user_by_email_raw(email)
        if not user:
            raise InvalidCredentialsError("Invalid email or password")

        if not verify_password(password, user.get("password_hash", "")):
            raise InvalidCredentialsError("Invalid email or password")

        user_id = str(user["_id"])
        token = create_access_token(subject=user_id)
        expires_in = settings.JWT_EXPIRES_IN_MINUTES * 60  

        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": expires_in
        }

    @staticmethod
    async def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
        doc = await get_user_by_id_raw(user_id)
        return serialize_user(doc) if doc else None