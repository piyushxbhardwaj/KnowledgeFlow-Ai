from pydantic import BaseModel
from typing import List

class SearchQueryCount(BaseModel):
    query: str
    count: int

class AnalyticsResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    most_searched: List[SearchQueryCount]
