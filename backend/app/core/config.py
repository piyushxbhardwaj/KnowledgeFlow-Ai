import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get root of backend (backend/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    # Storage for uploaded documents
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    # Storage for FAISS index
    VECTOR_DB_DIR: str = os.path.join(BASE_DIR, "vector_store")

    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_DB_DIR, exist_ok=True)
