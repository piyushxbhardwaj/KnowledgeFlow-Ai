from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.role import Role

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    role_id: int

class UserResponse(UserBase):
    id: int
    role_id: int
    created_at: datetime
    role: Optional[Role] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
