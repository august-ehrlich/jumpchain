from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.jumper import Jumper, Build
from schemas.jumper import JumperCreate, BuildCreate, BuildUpdate
from crud.document import get_document
from services.build_logic import validate_and_calculate_build

async def get_jumper(db: AsyncSession, jumper_id: int):
    stmt = (
        select(Jumper)
        .where(Jumper.id == jumper_id)
        .options(
            selectinload(Jumper.builds).selectinload(Build.traits),
            selectinload(Jumper.builds).selectinload(Build.document)
        )
    )
    return (await db.execute(stmt)).scalar_one_or_none()

async def get_all_jumpers(db: AsyncSession):
    stmt = select(Jumper).options(
        selectinload(Jumper.builds).selectinload(Build.traits),
        selectinload(Jumper.builds).selectinload(Build.document)
    )
    result = await db.execute(stmt)
    
    return result.scalars().unique().all()

async def create_jumper(db: AsyncSession, jumper: JumperCreate):
    db_jumper = Jumper(**jumper.model_dump())
    db.add(db_jumper)
    await db.commit()
    return await get_jumper(db, db_jumper.id)

async def create_build(db: AsyncSession, build: BuildCreate) -> Build:
    doc = await get_document(db, build.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    jumper = await get_jumper(db, build.jumper_id)
    if not jumper:
        raise HTTPException(status_code=404, detail="Jumper not found")
        
    selected_traits, remaining_cp = validate_and_calculate_build(doc, build.trait_ids)
    
    # Fallback to jumper's baseline age
    final_age = build.age if build.age is not None else jumper.age
    final_gender = build.gender if build.gender is not None else jumper.gender
    
    db_build = Build(
        jumper_id=build.jumper_id, 
        document_id=build.document_id, 
        remaining_cp=remaining_cp,
        age=final_age,
        gender=final_gender
    )

    db_build.traits.extend(selected_traits)
    
    db.add(db_build)
    await db.commit()
    
    stmt = (
        select(Build)
        .where(Build.id == db_build.id)
        .options(
            selectinload(Build.traits)
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one()

async def delete_jumper(db: AsyncSession, jumper_id: int):
    db_jumper = await get_jumper(db, jumper_id)
    if not db_jumper:
        return False
    await db.delete(db_jumper)
    await db.commit()
    return True

async def delete_build(db: AsyncSession, jumper_id: int, build_id: int):
    stmt = select(Build).where(Build.id == build_id, Build.jumper_id == jumper_id)
    db_build = (await db.execute(stmt)).scalar_one_or_none()
    if not db_build:
        return False
    await db.delete(db_build)
    await db.commit()
    return True

async def update_build(db: AsyncSession, jumper_id: int, build_id: int, build_update: BuildUpdate):
    stmt = select(Build).where(Build.id == build_id, Build.jumper_id == jumper_id).options(selectinload(Build.traits))
    db_build = (await db.execute(stmt)).scalar_one_or_none()
    if not db_build:
        raise HTTPException(status_code=404, detail="Build not found")
        
    doc = await get_document(db, db_build.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
            
    jumper = await get_jumper(db, jumper_id)
    if not jumper:
        raise HTTPException(status_code=404, detail="Jumper not found")

    selected_traits, remaining_cp = validate_and_calculate_build(doc, build_update.trait_ids)
    
    db_build.traits.clear()
    db_build.traits.extend(selected_traits)
    db_build.remaining_cp = remaining_cp
    
    # Apply new age or fallback to baseline
    db_build.age = build_update.age if build_update.age is not None else jumper.age
    db_build.gender = build_update.gender if build_update.gender is not None else jumper.gender
    
    await db.commit()