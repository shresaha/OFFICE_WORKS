from typing import Dict, List
from app.repositories.table_repository import TableRepository
from app.repositories.table_cell_repository import TableCellRepository
from app.services.core_service import CoreService
from app.schemas.table_schemas import (
    TableGridResponse,
    CoreRowResponse,
    SystemHeadingResponse,
)


class TableGridService:
    def __init__(self):
        self.table_repository = TableRepository()
        self.cell_repository = TableCellRepository()
        self.core_service = CoreService()

    async def get_full_grid(self) -> TableGridResponse:
        system_heading_docs = await self.table_repository.get_all_system_headings()

        headers = [
            SystemHeadingResponse(
                id=str(doc["_id"]),
                name=doc["name"],
                created_at=doc["created_at"],
            )
            for doc in system_heading_docs
        ]

        core_responses = await self.core_service.get_all_cores()

        core_map = {
            core.name: str(core.id)
            for core in core_responses
        }

        cores = list(core_map.keys())

        cell_docs = await self.cell_repository.get_all_cells()

        cell_map: Dict[tuple, str] = {}
        for cell in cell_docs:
            cell_map[(cell["core_name"], cell["system_heading_id"])] = cell.get("value")

        rows: List[CoreRowResponse] = []

        for core_name in cores:
            values = {}

            for header in headers:
                values[header.id] = cell_map.get((core_name, header.id))

            rows.append(
                CoreRowResponse(
                    core_id=core_map.get(core_name),
                    core_name=core_name,
                    values=values,
                )
            )

        return TableGridResponse(
            headers=headers,
            cores=cores,
            rows=rows,
        )
