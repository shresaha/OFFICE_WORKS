from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class SystemHeadingBase(BaseModel):
    name: str = Field(..., min_length=1, description="System column name")

class CreateSystemHeadingRequest(SystemHeadingBase):
    pass

class SystemHeadingResponse(SystemHeadingBase):
    id: str
    created_at: datetime

class TableMetadataResponse(BaseModel):
    headers: List[SystemHeadingResponse]
    cores: List[str]

class CoreRowResponse(BaseModel):
    core_id: str
    core_name: str
    values: Dict[str, Optional[str]]


class TableGridResponse(TableMetadataResponse):
    rows: List[CoreRowResponse]
