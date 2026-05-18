from typing import List
from bson import ObjectId
from datetime import datetime

from app.repositories.core_repository import CoreRepository
from app.repositories.table_cell_repository import TableCellRepository
from app.schemas.core_schemas import (
    CreateCoreRequest,
    UpdateCoreRequest,
    CoreResponse,
)

class DuplicateCoreError(Exception):
    pass

class CoreNotFoundError(Exception):
    pass


class CoreService:
    def __init__(self):
        self.core_repository = CoreRepository()
        self.cell_repository = TableCellRepository()


    async def create_core(self, payload: CreateCoreRequest) -> CoreResponse:
        existing = await self.core_repository.get_core_by_name(payload.name)
        if existing:
            raise DuplicateCoreError(
                f"Core '{payload.name}' already exists."
            )

        document = await self.core_repository.create_core(payload.name)

        return CoreResponse(
            id=str(document["_id"]),
            name=document["name"],
            created_at=document["created_at"],
            updated_at=document["updated_at"],
        )
    

    async def get_all_cores(self) -> List[CoreResponse]:
        documents = await self.core_repository.get_all_cores()

        return [
            CoreResponse(
                id=str(doc["_id"]),
                name=doc["name"],
                created_at=doc["created_at"],
                updated_at=doc["updated_at"],
            )
            for doc in documents
        ]
    

    async def update_core(
        self,
        core_id: str,
        payload: UpdateCoreRequest,
    ) -> CoreResponse:

        core_object_id = ObjectId(core_id)

        existing_core = await self.core_repository.get_core_by_id(core_object_id)
        if not existing_core:
            raise CoreNotFoundError("Core not found.")

        duplicate = await self.core_repository.get_core_by_name(payload.name)
        if duplicate and str(duplicate["_id"]) != core_id:
            raise DuplicateCoreError(
                f"Core '{payload.name}' already exists."
            )

        old_name = existing_core["name"]

        async with await self.core_repository.client.start_session() as session:
            async with session.start_transaction():

                updated_core = await self.core_repository.update_core_name(
                    core_object_id,
                    payload.name,
                    session=session,
                )
                
                await self._propagate_core_rename(
                    old_name=old_name,
                    new_name=payload.name,
                    session=session,
                )

        return CoreResponse(
            id=str(updated_core["_id"]),
            name=updated_core["name"],
            created_at=updated_core["created_at"],
            updated_at=updated_core["updated_at"],
        )
    

    async def _propagate_core_rename(
        self,
        old_name: str,
        new_name: str,
        session,
    ) -> None:
        await self.cell_repository.collection.update_many(
            {"core_name": old_name},
            {
                "$set": {
                    "core_name": new_name,
                    "updated_at": datetime.utcnow(),
                }
            },
            session=session,
        )


    async def delete_core(self, core_id: str) -> None:
        core_object_id = ObjectId(core_id)

        core = await self.core_repository.get_core_by_id(core_object_id)
        if not core:
           raise CoreNotFoundError("Core not found.")

        core_name = core["name"]

        await self.cell_repository.delete_cells_by_core_name(core_name)
        await self.core_repository.delete_core(core_object_id)
