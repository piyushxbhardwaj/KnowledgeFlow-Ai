import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.deps import get_current_user, RoleChecker
from app.core.logging import log_activity
from app.core.config import settings
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.vector_db import vector_db_service

router = APIRouter()

@router.get("", response_model=list[DocumentResponse])
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Document).all()

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    current_user: User = Depends(RoleChecker(["Admin"])),
    db: Session = Depends(get_db)
):
    filename = file.filename
    if not filename.endswith(".txt"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only plain text (.txt) files are supported for upload."
        )
        
    try:
        content_bytes = await file.read()
        content_text = content_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read text file: {e}"
        )
        
    doc_title = title if title else os.path.splitext(filename)[0]
    
    # Save file to disk
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content_bytes)
        
    # Store metadata in MySQL
    db_document = Document(
        title=doc_title,
        filename=filename,
        file_path=file_path,
        file_size=len(content_bytes),
        content_text=content_text,
        uploaded_by=current_user.id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Generate embeddings and save in FAISS Vector DB
    try:
        vector_db_service.add_document(
            doc_id=db_document.id,
            title=db_document.title,
            text=content_text
        )
    except Exception as e:
        print(f"Error processing semantic embeddings for document {db_document.id}: {e}")
        
    log_activity(
        db,
        user_id=current_user.id,
        action="Document Upload",
        details=f"Uploaded document ID {db_document.id} '{db_document.title}' ({db_document.file_size} bytes)"
    )
    
    return db_document
