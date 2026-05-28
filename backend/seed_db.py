import os
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
from app.models.role import Role
from app.models.user import User
from app.core.security import get_password_hash

# Setup DB
db_url = "sqlite:///./knowledge_flow.db"
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Create roles
admin_role = db.query(Role).filter(Role.name == "Admin").first()
if not admin_role:
    admin_role = Role(name="Admin")
    db.add(admin_role)

user_role = db.query(Role).filter(Role.name == "User").first()
if not user_role:
    user_role = Role(name="User")
    db.add(user_role)

db.commit()

# Create admin user
admin = db.query(User).filter(User.username == "admin").first()
if not admin:
    admin = User(
        username="admin",
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword"),
        role_id=admin_role.id
    )
    db.add(admin)
    db.commit()

print("Database seeded successfully.")
db.close()
