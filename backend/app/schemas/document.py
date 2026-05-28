from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentBase(BaseModel):
    title: str

class DocumentResponse(DocumentBase):
    id: int
    filename: str
    file_size: int
    uploaded_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class SearchQuery(BaseModel):
    query: str

class SearchResult(BaseModel):
    document_id: int
    title: str
    text: str
    score: float
