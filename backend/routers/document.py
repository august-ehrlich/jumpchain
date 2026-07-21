from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
import crud, schemas

router = APIRouter(prefix="/documents", tags=["Documents"])


router = APIRouter()

@router.get("/{document_id}", response_model=schemas.DocumentResponse)
async def read_document(document_id: int, db: AsyncSession = Depends(get_db)):
    db_document = await crud.get_document(db, document_id)
    if db_document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@router.post("/", response_model=schemas.DocumentResponse)
async def create_document(document: schemas.DocumentCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_document(db=db, document=document)
