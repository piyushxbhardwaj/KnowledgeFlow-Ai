import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        # Check and seed roles
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        if not admin_role:
            admin_role = Role(name="Admin")
            db.add(admin_role)
            print("Added Role: Admin")
        
        user_role = db.query(Role).filter(Role.name == "User").first()
        if not user_role:
            user_role = Role(name="User")
            db.add(user_role)
            print("Added Role: User")
            
        db.commit()
        
        # Refresh to get IDs
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        user_role = db.query(Role).filter(Role.name == "User").first()
        
        # Check and seed admin user
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@example.com",
                password_hash=get_password_hash("AdminPassword123"),
                role_id=admin_role.id
            )
            db.add(admin_user)
            print("Seeded Admin User: admin@example.com / AdminPassword123")
            
        # Check and seed a normal user
        test_user = db.query(User).filter(User.email == "user@example.com").first()
        if not test_user:
            test_user = User(
                username="user",
                email="user@example.com",
                password_hash=get_password_hash("UserPassword123"),
                role_id=user_role.id
            )
            db.add(test_user)
            print("Seeded User Account: user@example.com / UserPassword123")
            
        db.commit()
        print("Database successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
