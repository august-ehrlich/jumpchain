from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from schemas.document import Document, DocumentCreate, DocumentUpdate
import crud
from typing import List

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/{document_id}", response_model=Document)
async def read_document(document_id: int, db: AsyncSession = Depends(get_db)):
    db_document = await crud.get_document(db, document_id)
    if db_document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@router.post("/", response_model=Document)
async def create_document(document: DocumentCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_document(db=db, document=document)

@router.get("/", response_model=List[Document])
async def read_all_documents(db: AsyncSession = Depends(get_db)):
    return await crud.get_all_documents(db)

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.delete_document(db, document_id)

@router.put("/{document_id}", response_model=Document)
async def update_document(document_id: int, document: DocumentUpdate, db: AsyncSession = Depends(get_db)):
    updated_doc = await crud.update_document(db=db, document_id=document_id, document_update=document)
    if not updated_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated_doc