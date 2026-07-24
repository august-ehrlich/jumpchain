from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
import crud, schemas
from typing import List

router = APIRouter(prefix="/document", tags=["Documents"])

@router.get("/{document_id}", response_model=schemas.DocumentResponse)
async def read_document(document_id: int, db: AsyncSession = Depends(get_db)):
    db_document = await crud.get_document(db, document_id)
    if db_document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@router.post("/", response_model=schemas.DocumentResponse)
async def create_document(document: schemas.DocumentCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_document(db=db, document=document)

@router.get("/", response_model=List[schemas.DocumentResponse])
async def read_all_documents(db: AsyncSession = Depends(get_db)):
    return await crud.get_all_documents(db)

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.delete_document(db, document_id)