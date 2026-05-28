from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.deps import get_current_user, RoleChecker
from app.core.logging import log_activity
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("", response_model=list[TaskResponse])
def get_tasks(
    status: str = None,
    assigned_to: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    
    # If the user is a normal User, restrict them to their assigned tasks
    if current_user.role.name == "User":
        query = query.filter(Task.assigned_to == current_user.id)
        if status:
            query = query.filter(Task.status == status)
    else:
        # Admin can view all and apply dynamic filters
        if status:
            query = query.filter(Task.status == status)
        if assigned_to:
            query = query.filter(Task.assigned_to == assigned_to)
            
    return query.all()

@router.get("/users", response_model=list[UserResponse])
def get_assignable_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve all users so Admin can assign tasks to them
    return db.query(User).all()

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(RoleChecker(["Admin"])),
    db: Session = Depends(get_db)
):
    # Verify assignee user exists
    assignee = db.query(User).filter(User.id == task_data.assigned_to).first()
    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assigned user does not exist"
        )
        
    db_task = Task(
        title=task_data.title,
        description=task_data.description,
        status="Pending",
        assigned_to=task_data.assigned_to,
        created_by=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    log_activity(
        db,
        user_id=current_user.id,
        action="Task Update",  # matches required activity categories
        details=f"Created task ID {db_task.id} '{db_task.title}' assigned to {assignee.username}"
    )
    return db_task

@router.put("/{id}", response_model=TaskResponse)
def update_task_status(
    id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_task = db.query(Task).filter(Task.id == id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
        
    # Check permissions: Users can only update their own tasks, Admins can update any task
    if current_user.role.name == "User" and db_task.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this task"
        )
        
    # Check valid status transitions
    if task_update.status not in ["Pending", "Completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task status. Allowed values: 'Pending', 'Completed'"
        )
        
    old_status = db_task.status
    db_task.status = task_update.status
    db.commit()
    db.refresh(db_task)
    
    log_activity(
        db,
        user_id=current_user.id,
        action="Task Update",
        details=f"Updated task ID {db_task.id} status from '{old_status}' to '{db_task.status}'"
    )
    return db_task
