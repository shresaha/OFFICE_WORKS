from datetime import datetime
from typing import Optional, List
from app.core.database import get_database


class TableCellRepository:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db["table_cells"]

    async def get_cell(
        self,
        core_name: str,
        system_heading_id: str,
    ) -> Optional[dict]:
        return await self.collection.find_one(
            {
                "core_name": core_name,
                "system_heading_id": system_heading_id,
            }
        )

    async def upsert_cell(
        self,
        core_name: str,
        system_heading_id: str,
        value: Optional[str],
    ) -> dict:
        now = datetime.utcnow()

        await self.collection.update_one(
            {
                "core_name": core_name,
                "system_heading_id": system_heading_id,
            },
            {
                "$set": {
                    "core_name": core_name,
                    "system_heading_id": system_heading_id,
                    "value": value,
                    "updated_at": now,
                }
            },
            upsert=True,
        )

        return await self.collection.find_one(
            {
                "core_name": core_name,
                "system_heading_id": system_heading_id,
            }
        )
    

    async def get_all_cells(self) -> List[dict]:
        return await self.collection.find().to_list(length=None)
    

    async def delete_cells_by_core_name(
     self,
     core_name: str
) -> None:
     await self.collection.delete_many(
        {"core_name": core_name}
    )

    
    async def delete_cells_by_system_heading_id(
        self,
        system_heading_id: str,
    ) -> None:
        await self.collection.delete_many(
            {"system_heading_id": system_heading_id}
        )

    

