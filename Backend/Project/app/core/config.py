from __future__ import annotations
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class SettingsError(RuntimeError):
    pass


def _require(name: str) -> str:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        raise SettingsError(f"Missing required environment variable: {name}")
    return value


def _list_from_env(name: str, default: List[str] | None = None) -> List[str]:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default or []
    return [item.strip() for item in raw.split(",") if item.strip()]


class Settings:
    MONGO_URI: str
    MONGO_DB_NAME: str
    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_EXPIRES_IN_MINUTES: int
    CORS_ORIGINS: List[str]

    def __init__(self) -> None:
        self.MONGO_URI = _require("MONGO_URI")
        self.MONGO_DB_NAME = _require("MONGO_DB_NAME")
        self.JWT_SECRET = _require("JWT_SECRET")
        self.JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
        self.JWT_EXPIRES_IN_MINUTES = int(os.getenv("JWT_EXPIRES_IN_MINUTES", "60"))

        cors = _list_from_env("CORS_ORIGINS", ["http://localhost:4200"])
        self.CORS_ORIGINS = cors if cors else ["http://localhost:4200"]

settings = Settings()