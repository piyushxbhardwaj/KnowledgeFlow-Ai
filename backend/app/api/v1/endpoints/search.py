from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.core.logging import log_activity
from app.models.user import User
from app.schemas.document import SearchQuery, SearchResult
from app.services.vector_db import vector_db_service

router = APIRouter()

@router.post("", response_model=list[SearchResult])
def search_documents(
    payload: SearchQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = payload.query.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty"
        )
        
    try:
        results = vector_db_service.search(query, top_k=5)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic search failed: {e}"
        )
        
    # Log search action
    log_activity(
        db,
        user_id=current_user.id,
        action="Search",
        details=query  # Store query term directly in details to fetch for analytics
    )
    
    return results
