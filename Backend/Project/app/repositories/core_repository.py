from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from pymongo import ReturnDocument

from app.core.database import get_database


class CoreRepository:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db["cores"]
        self.client = self.db.client  # ✅ REQUIRED for transactions

    async def create_core(self, name: str) -> dict:
        now = datetime.utcnow()

        document = {
            "name": name,
            "created_at": now,
            "updated_at": now,
        }

        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    async def get_core_by_name(self, name: str) -> Optional[dict]:
        return await self.collection.find_one({"name": name})

    async def get_core_by_id(self, core_id: ObjectId) -> Optional[dict]:
        return await self.collection.find_one({"_id": core_id})

    async def get_all_cores(self) -> List[dict]:
        return await self.collection.find().to_list(length=None)

    async def update_core_name(
        self,
        core_id: ObjectId,
        new_name: str,
        session=None,
    ) -> Optional[dict]:
        return await self.collection.find_one_and_update(
            {"_id": core_id},
            {
                "$set": {
                    "name": new_name,
                    "updated_at": datetime.utcnow(),
                }
            },
            return_document=ReturnDocument.AFTER,
            session=session,
        )

    async def delete_core(
        self,
        core_id: ObjectId,
        session=None,
    ) -> None:
        await self.collection.delete_one(
            {"_id": core_id},
            session=session,
        )