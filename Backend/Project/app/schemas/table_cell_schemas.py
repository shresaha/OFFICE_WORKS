from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TableCellBase(BaseModel):
    core_name: str = Field(..., min_length=1)
    system_heading_id: str = Field(..., min_length=1)


class UpdateTableCellRequest(TableCellBase):
    value: Optional[str] = None


class TableCellResponse(BaseModel):
    id: str
    core_name: str
    system_heading_id: Optional[str]  
    value: Optional[str]
    updated_at: datetime