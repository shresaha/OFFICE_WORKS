from fastapi import APIRouter, HTTPException, status

from app.schemas.core_schemas import (
    CreateCoreRequest,
    UpdateCoreRequest,
    CoreResponse,
)

from app.services.core_service import (
    CoreService,
    DuplicateCoreError,
    CoreNotFoundError,
)

router = APIRouter(
    prefix="/table/cores",
    tags=["Cores"],
)

core_service = CoreService()


@router.post(
    "",
    response_model=CoreResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_core(payload: CreateCoreRequest):
    try:
        return await core_service.create_core(payload)
    except DuplicateCoreError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.put(
    "/{core_id}",
    response_model=CoreResponse,
    status_code=status.HTTP_200_OK,
)
async def update_core(core_id: str, payload: UpdateCoreRequest):
    try:
        return await core_service.update_core(core_id, payload)
    except CoreNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except DuplicateCoreError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.delete(
    "/{core_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_core(core_id: str):
    try:
        await core_service.delete_core(core_id)
    except CoreNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
