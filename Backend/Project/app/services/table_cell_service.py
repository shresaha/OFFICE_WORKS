from typing import List
from fastapi import HTTPException
from app.repositories.table_cell_repository import TableCellRepository
from app.repositories.table_repository import TableRepository
from app.schemas.table_cell_schemas import (
    UpdateTableCellRequest,
    TableCellResponse,
)


class TableCellService:
    def __init__(self):
        self.repository = TableCellRepository()
        self.table_repository = TableRepository()


    async def update_cell(
        self,
        payload: UpdateTableCellRequest
    ) -> TableCellResponse:
        system = await self.table_repository.get_system_heading_by_id(
            payload.system_heading_id
        )

        if not system:
            raise HTTPException(
                status_code=400,
                detail="Invalid system_heading_id"
            )

        document = await self.repository.upsert_cell(
            core_name=payload.core_name,
            system_heading_id=payload.system_heading_id, 
            value=payload.value,
        )

        return TableCellResponse(
            id=str(document["_id"]),
            core_name=document["core_name"],
            system_heading_id=system["name"], 
            value=document.get("value"),
            updated_at=document["updated_at"],
        )
    

    async def get_all_cells(self) -> List[TableCellResponse]:
        documents = await self.repository.get_all_cells()

        responses: List[TableCellResponse] = []

        for doc in documents:
            system = await self.table_repository.get_system_heading_by_id(
                doc["system_heading_id"]
            )

            responses.append(
                TableCellResponse(
                    id=str(doc["_id"]),
                    core_name=doc["core_name"],
                    system_heading_id=system["name"] if system else None,
                    value=doc.get("value"),
                    updated_at=doc["updated_at"],
                )
            )

        return responses
