from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from bson import ObjectId
from bson.errors import InvalidId  

USERS_COLLECTION = "users"


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def build_user_doc(
    name: str,
    email: str,
    password_hash: str,
    *,
    created_at: Optional[datetime] = None,
    updated_at: Optional[datetime] = None,
) -> Dict[str, Any]:
    created = created_at or now_utc()
    updated = updated_at or created
    return {
        "name": name.strip(),
        "email": normalize_email(email),
        "password_hash": password_hash,
        "created_at": created,
        "updated_at": updated,
    }


def serialize_user(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}
    
    user_id = doc.get("_id")
    if isinstance(user_id, ObjectId):
        user_id = str(user_id)
    elif user_id is not None:
        user_id = str(user_id)

    return {
        "id": user_id,
        "name": doc.get("name"),
        "email": doc.get("email"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def to_object_id(id_or_str: Any) -> ObjectId:
    if isinstance(id_or_str, ObjectId):
        return id_or_str
    
    return ObjectId(str(id_or_str))