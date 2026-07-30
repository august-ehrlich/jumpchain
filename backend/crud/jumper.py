from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.jumper import Jumper, Build
from models.document import Trait
from schemas.jumper import JumperCreate, BuildCreate, BuildUpdate
from crud.document import get_document

async def get_jumper(db: AsyncSession, jumper_id: int):
    stmt = (
        select(Jumper)
        .where(Jumper.id == jumper_id)
        .options(
            selectinload(Jumper.builds).selectinload(Build.traits).selectinload(Trait.discounts_received),
            selectinload(Jumper.builds).selectinload(Build.document)
        )
    )
    return (await db.execute(stmt)).scalar_one_or_none()

async def get_all_jumpers(db: AsyncSession):
    stmt = select(Jumper).options(
        selectinload(Jumper.builds).selectinload(Build.traits).selectinload(Trait.discounts_received),
        selectinload(Jumper.builds).selectinload(Build.document)
    )
    result = await db.execute(stmt)
    
    return result.scalars().unique().all()

async def create_jumper(db: AsyncSession, jumper: JumperCreate):
    db_jumper = Jumper(**jumper.model_dump())
    db.add(db_jumper)
    await db.commit()
    return await get_jumper(db, db_jumper.id)

async def create_build(db: AsyncSession, build: BuildCreate):
    doc = await get_document(db, build.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc_traits = {t.id: (t, c) for c in doc.categories for t in c.traits}
    selected_traits : list[Trait] = []
    category_counts : dict[int, int] = {}
    
    for tid in build.trait_ids:
        if tid not in doc_traits:
            raise HTTPException(status_code=400, detail=f"Trait {tid} is not from this document.")
        t, c = doc_traits[tid]
        selected_traits.append(t)
        
        if not t.is_modifier:
            category_counts[c.id] = category_counts.get(c.id, 0) + 1
            
    for c in doc.categories:
        if c.max_allowed != -1 and category_counts.get(c.id, 0) > c.max_allowed:
            raise HTTPException(
                status_code=400, 
                detail=f"Exceeded max allowed traits ({c.max_allowed}) in category '{c.name}'"
            )
            
    spent_cp = 0
    selected_ids = set(build.trait_ids)
    
    for t in selected_traits:
        if t.cost < 0:
            spent_cp += t.cost 
        else:
            current_cost = float(t.cost)
            for discount in t.discounts_received:
                if discount.source_trait_id in selected_ids:
                    current_cost *= (1.0 - (discount.discount / 100.0))
            spent_cp += round(current_cost)
            
    remaining_cp = doc.choice_points - spent_cp
    if remaining_cp < 0:
        raise HTTPException(status_code=400, detail=f"Over budget! Deficit of {abs(remaining_cp)} CP.")
        
    db_build = Build(
        jumper_id=build.jumper_id, 
        document_id=build.document_id, 
        remaining_cp=remaining_cp
    )
    db_build.traits.extend(selected_traits)
    
    db.add(db_build)
    await db.commit()
    
    stmt = (
        select(Build)
        .where(Build.id == db_build.id)
        .options(
            selectinload(Build.traits).selectinload(Trait.discounts_received)
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
    assert doc is not None
    doc_traits = {t.id: (t, c) for c in doc.categories for t in c.traits}
    selected_traits : list[Trait] = []
    category_counts : dict[int, int] = {}
    
    for tid in build_update.trait_ids:
        if tid not in doc_traits:
            raise HTTPException(status_code=400, detail=f"Trait {tid} is not from this document.")
        t, c = doc_traits[tid]
        selected_traits.append(t)
        if not t.is_modifier:
            category_counts[c.id] = category_counts.get(c.id, 0) + 1
            
    for c in doc.categories:
        if c.max_allowed != -1 and category_counts.get(c.id, 0) > c.max_allowed:
            raise HTTPException(
                status_code=400, 
                detail=f"Exceeded max allowed traits ({c.max_allowed}) in category '{c.name}'"
            )
            
    spent_cp = 0
    selected_ids = set(build_update.trait_ids)
    
    for t in selected_traits:
        if t.cost < 0:
            spent_cp += t.cost 
        else:
            current_cost = float(t.cost)
            for discount in t.discounts_received:
                if discount.source_trait_id in selected_ids:
                    current_cost *= (1.0 - (discount.discount / 100.0))
            spent_cp += round(current_cost)
            
    remaining_cp = doc.choice_points - spent_cp
    if remaining_cp < 0:
        raise HTTPException(status_code=400, detail=f"Over budget! Deficit of {abs(remaining_cp)} CP.")
        
    db_build.traits.clear()
    db_build.traits.extend(selected_traits)
    db_build.remaining_cp = remaining_cp
    
    await db.commit()
    
    stmt_refresh = select(Build).where(Build.id == db_build.id).options(
        selectinload(Build.traits).selectinload(Trait.discounts_received)
    )
    return (await db.execute(stmt_refresh)).scalar_one()