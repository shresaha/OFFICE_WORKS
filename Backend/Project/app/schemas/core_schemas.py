from pydantic import BaseModel, Field
from datetime import datetime


class CoreBase(BaseModel):
    name: str = Field(..., min_length=1, description="Core name")


class CreateCoreRequest(CoreBase):
    pass


class UpdateCoreRequest(CoreBase):
    pass


class CoreResponse(CoreBase):
    id: str
    created_at: datetime
    updated_at: datetime
