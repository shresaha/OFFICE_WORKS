from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from app.core.database import get_database


class TableRepository:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db["system_headings"]


    async def create_system_heading(self, name: str) -> dict:
        document = {
            "name": name,
            "created_at": datetime.utcnow(),
        }
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return document
    

    async def get_system_heading_by_name(self, name: str) -> Optional[dict]:
        return await self.collection.find_one({"name": name})



    async def get_system_heading_by_id(self, system_id: str) -> Optional[dict]:
        if not ObjectId.is_valid(system_id):
            return None

        return await self.collection.find_one(
            {"_id": ObjectId(system_id)}
        )
    

    async def get_all_system_headings(self) -> List[dict]:
        return await self.collection.find().to_list(length=None)
    
    
    async def update_system_heading_name(
        self,
        system_heading_id: ObjectId,
        new_name: str,
    ) -> dict | None:
        await self.collection.update_one(
            {"_id": system_heading_id},
            {"$set": {"name": new_name}},
        )
        return await self.collection.find_one({"_id": system_heading_id})
    
    
    async def delete_system_heading(self, system_heading_id: ObjectId) -> None:
        await self.collection.delete_one(
            {"_id": system_heading_id}
        )


