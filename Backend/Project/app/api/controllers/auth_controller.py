from __future__ import annotations
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth_schemas import SignupRequest, LoginRequest, TokenResponse, MeResponse, UserResponse
from app.services.auth_service import AuthService, InvalidCredentialsError
from app.repositories.user_repository import DuplicateEmailError, InvalidObjectIdError
from app.utils.jwt_utils import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()


router = APIRouter(prefix="/auth", tags=["auth"])


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:

    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    try:
        user = await AuthService.get_user_profile(user_id)
    except InvalidObjectIdError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user id in token",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(req: SignupRequest):
    try:
        user = await AuthService.signup(req.name, req.email, req.password)
        return user
    except DuplicateEmailError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    try:
        token = await AuthService.login(req.email, req.password)
        return token
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get(
    "/me",
    response_model=MeResponse,
    dependencies=[Depends(security)],
    openapi_extra={"security": [{"BearerAuth": []}]}
)
async def me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return current_user