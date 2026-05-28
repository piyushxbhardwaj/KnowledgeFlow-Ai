from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.deps import RoleChecker
from app.models.user import User
from app.models.task import Task
from app.models.activity_log import ActivityLog
from app.schemas.analytics import AnalyticsResponse, SearchQueryCount

router = APIRouter()

@router.get("", response_model=AnalyticsResponse)
def get_analytics(
    current_user: User = Depends(RoleChecker(["Admin"])),
    db: Session = Depends(get_db)
):
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == "Completed").count()
    pending_tasks = db.query(Task).filter(Task.status == "Pending").count()
    
    # Query most searched terms from logs
    top_queries = db.query(
        ActivityLog.details.label("query"),
        func.count(ActivityLog.id).label("count")
    ).filter(
        ActivityLog.action == "Search",
        ActivityLog.details.isnot(None),
        ActivityLog.details != ""
    ).group_by(
        ActivityLog.details
    ).order_by(
        func.count(ActivityLog.id).desc()
    ).limit(5).all()
    
    most_searched_list = [
        SearchQueryCount(query=q.query, count=q.count) for q in top_queries
    ]
    
    return AnalyticsResponse(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        most_searched=most_searched_list
    )
