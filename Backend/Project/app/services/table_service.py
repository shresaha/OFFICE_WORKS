from typing import List
from app.repositories.table_repository import TableRepository
from app.repositories.table_cell_repository import TableCellRepository
from app.schemas.table_schemas import SystemHeadingResponse
from bson import ObjectId

class DuplicateSystemHeadingError(Exception):
    pass

class SystemHeadingNotFoundError(Exception):
    pass

class TableService:
    def __init__(self):
        self.repository = TableRepository()
        self.cell_repository = TableCellRepository()


    async def create_system_heading(self, name: str) -> SystemHeadingResponse:
        existing = await self.repository.get_system_heading_by_name(name)
        if existing:
            raise DuplicateSystemHeadingError(
                f"System heading '{name}' already exists."
            )

        document = await self.repository.create_system_heading(name)

        return SystemHeadingResponse(
            id=str(document["_id"]),
            name=document["name"],
            created_at=document["created_at"],
        )


    async def get_all_system_headings(self) -> List[SystemHeadingResponse]:
        documents = await self.repository.get_all_system_headings()

        return [
            SystemHeadingResponse(
                id=str(doc["_id"]),
                name=doc["name"],
                created_at=doc["created_at"],
            )
            for doc in documents
        ]
    
    
    async def update_system_heading(
        self,
        system_heading_id: str,
        new_name: str,
    ) -> SystemHeadingResponse:
        obj_id = ObjectId(system_heading_id)

        updated = await self.repository.update_system_heading_name(
            obj_id,
            new_name,
        )
        if not updated:
            raise SystemHeadingNotFoundError("System heading not found.")

        return SystemHeadingResponse(
            id=str(updated["_id"]),
            name=updated["name"],
            created_at=updated["created_at"],
        )
    
    
    async def delete_system_heading(self, system_heading_id: str) -> None:
        obj_id = ObjectId(system_heading_id)

        heading = await self.repository.get_system_heading_by_id(obj_id)
        if not heading:
            raise SystemHeadingNotFoundError("System heading not found.")

        await self.cell_repository.delete_cells_by_system_heading_id(
            system_heading_id
        )

        await self.repository.delete_system_heading(obj_id)


 


