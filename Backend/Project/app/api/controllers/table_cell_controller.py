from fastapi import APIRouter, status

from app.schemas.table_cell_schemas import (
    UpdateTableCellRequest,
    TableCellResponse,
)
from app.services.table_cell_service import TableCellService

router = APIRouter(
    prefix="/table/cells",
    tags=["Table Cells"],
)

table_cell_service = TableCellService()


@router.put(
    "",
    response_model=TableCellResponse,
    status_code=status.HTTP_200_OK,
)
async def update_table_cell(payload: UpdateTableCellRequest):
    return await table_cell_service.update_cell(payload)


@router.get(
    "",
    response_model=list[TableCellResponse],
    status_code=status.HTTP_200_OK,
)
async def get_all_table_cells():
    return await table_cell_service.get_all_cells()
