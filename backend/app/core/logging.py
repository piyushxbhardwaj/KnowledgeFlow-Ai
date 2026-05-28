from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog

def log_activity(db: Session, user_id: int or None, action: str, details: str, ip_address: str = None):
    """Inserts a structured action entry into the activity_logs table."""
    try:
        log = ActivityLog(
            user_id=user_id,
            action=action,
            details=details,
            ip_address=ip_address
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Failed to write activity log: {e}")
        db.rollback()
