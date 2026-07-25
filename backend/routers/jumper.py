from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
import crud, schemas

router = APIRouter(prefix="/jumper", tags=["Jumpers"])

@router.get("/{jumper_id}", response_model=schemas.JumperResponse)
async def read_jumper(jumper_id: int, db: AsyncSession = Depends(get_db)):
    db_jumper = await crud.get_jumper(db, jumper_id)
    if db_jumper is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_jumper

@router.post("/", response_model=schemas.JumperResponse)
async def create_jumper(jumper: schemas.JumperCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_jumper(db=db, jumper=jumper)
