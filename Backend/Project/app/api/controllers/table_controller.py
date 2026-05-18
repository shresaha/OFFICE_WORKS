from fastapi import APIRouter, HTTPException, status

from app.schemas.table_schemas import (
    CreateSystemHeadingRequest,
    SystemHeadingResponse,
    TableMetadataResponse,
    TableGridResponse,
)
from app.services.table_service import (
    TableService,
    DuplicateSystemHeadingError,
    SystemHeadingNotFoundError
)
from app.services.core_service import CoreService
from app.services.table_grid_service import TableGridService


router = APIRouter(
    prefix="/table",
    tags=["Table"],
)

table_service = TableService()
core_service = CoreService()
grid_service = TableGridService()


@router.get(
    "/metadata",
    response_model=TableMetadataResponse,
    status_code=status.HTTP_200_OK,
)
async def get_table_metadata():
    headers = await table_service.get_all_system_headings()
    cores = [core.name for core in await core_service.get_all_cores()]

    return TableMetadataResponse(
        headers=headers,
        cores=cores,
    )


@router.post(
    "/columns",
    response_model=SystemHeadingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_system_heading(payload: CreateSystemHeadingRequest):
    try:
        return await table_service.create_system_heading(payload.name)
    except DuplicateSystemHeadingError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.get(
    "/grid",
    response_model=TableGridResponse,
    status_code=status.HTTP_200_OK,
)
async def get_full_table_grid():
    return await grid_service.get_full_grid()


@router.put(
    "/columns/{system_heading_id}",
    response_model=SystemHeadingResponse,
)
async def update_system_heading(
    system_heading_id: str,
    payload: CreateSystemHeadingRequest,
):
    return await table_service.update_system_heading(
        system_heading_id,
        payload.name,
    )


@router.delete(
    "/columns/{system_heading_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)

async def delete_system_heading(system_heading_id: str):
    try:
        await table_service.delete_system_heading(system_heading_id)
    except SystemHeadingNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

