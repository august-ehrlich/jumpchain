from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
import crud
from schemas import BuildUpdate, JumperResponse, JumperCreate, BuildCreate, BuildResponse
from typing import List

router = APIRouter(prefix="/jumpers", tags=["Jumpers"])

@router.get("/", response_model=List[JumperResponse])
async def read_all_jumpers(db: AsyncSession = Depends(get_db)):
    return await crud.jumper.get_all_jumpers(db)

@router.get("/{jumper_id}", response_model=JumperResponse)
async def read_jumper(jumper_id: int, db: AsyncSession = Depends(get_db)):
    db_jumper = await crud.jumper.get_jumper(db, jumper_id)
    if db_jumper is None:
        raise HTTPException(status_code=404, detail="Jumper not found")
    return db_jumper

@router.post("/", response_model=JumperResponse)
async def create_jumper(jumper: JumperCreate, db: AsyncSession = Depends(get_db)):
    return await crud.jumper.create_jumper(db=db, jumper=jumper)

@router.delete("/{jumper_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_jumper(jumper_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.jumper.delete_jumper(db, jumper_id)
    if not success:
        raise HTTPException(status_code=404, detail="Jumper not found")
    return None

@router.post("/{jumper_id}/builds", response_model=BuildResponse)
async def create_build(jumper_id: int, build: BuildCreate, db: AsyncSession = Depends(get_db)):
    if jumper_id != build.jumper_id:
        raise HTTPException(status_code=400, detail="Jumper ID mismatch")
    return await crud.jumper.create_build(db=db, build=build)

@router.put("/{jumper_id}/builds/{build_id}", response_model=BuildResponse)
async def update_build(jumper_id: int, build_id: int, build_update: BuildUpdate, db: AsyncSession = Depends(get_db)):
    return await crud.jumper.update_build(db=db, jumper_id=jumper_id, build_id=build_id, build_update=build_update)

@router.delete("/{jumper_id}/builds/{build_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_build(jumper_id: int, build_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.jumper.delete_build(db, jumper_id, build_id)
    if not success:
        raise HTTPException(status_code=404, detail="Build not found")
    return None