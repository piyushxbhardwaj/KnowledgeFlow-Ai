from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    assigned_to: int

class TaskUpdate(BaseModel):
    status: str  # 'Pending', 'Completed'

class TaskResponse(TaskBase):
    id: int
    status: str
    assigned_to: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserResponse] = None

    class Config:
        from_attributes = True
