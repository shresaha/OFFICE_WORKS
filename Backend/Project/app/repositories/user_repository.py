from __future__ import annotations
from typing import Any, Dict, Optional
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo.errors import DuplicateKeyError
from app.core.database import get_database
from app.models.user_model import (
    USERS_COLLECTION,
    normalize_email,
    build_user_doc,
    serialize_user,
    to_object_id,
)

class InvalidObjectIdError(ValueError):
    pass

class DuplicateEmailError(Exception):
    pass

def _collection() -> AsyncIOMotorCollection:
    db = get_database()
    return db[USERS_COLLECTION]


async def ensure_user_indexes() -> None:
    col = _collection()
    await col.create_index("email", unique=True, name="uniq_email")


async def get_user_by_email_raw(email: str) -> Optional[Dict[str, Any]]:
    col = _collection()
    return await col.find_one({"email": normalize_email(email)})


async def get_user_by_id_raw(user_id: str | ObjectId) -> Optional[Dict[str, Any]]:
    try:
        oid = to_object_id(user_id)
    except (InvalidId, ValueError) as e:
        raise InvalidObjectIdError(str(e)) from e
    col = _collection()
    return await col.find_one({"_id": oid})


async def create_user_raw(name: str, email: str, password_hash: str) -> Dict[str, Any]:
    col = _collection()
    doc = build_user_doc(name=name, email=email, password_hash=password_hash)
    try:
        result = await col.insert_one(doc)
    except DuplicateKeyError:
        raise DuplicateEmailError("Email already registered")

    created = await col.find_one({"_id": result.inserted_id})
    assert created is not None
    return created


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    doc = await get_user_by_email_raw(email)
    return serialize_user(doc) if doc else None


async def get_user_by_id(user_id: str | ObjectId) -> Optional[Dict[str, Any]]:
    doc = await get_user_by_id_raw(user_id)
    return serialize_user(doc) if doc else None


async def create_user(name: str, email: str, password_hash: str) -> Dict[str, Any]:
    created = await create_user_raw(name=name, email=email, password_hash=password_hash)
    return serialize_user(created)