from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.jumper import Build, Jumper
from models.document import Document, Perk, Item, Drawback
from schemas.jumper import BuildCreate, JumperCreate

async def get_jumper(db: AsyncSession, jumper_id: int):
    stmt = (
        select(Jumper)
        .where(Jumper.id == jumper_id)
        .options(
            selectinload(Jumper.builds)
        )
    )
    return (await db.execute(stmt)).scalar_one_or_none()

async def create_jumper(db: AsyncSession, jumper: JumperCreate):
    jumper_data = jumper.model_dump(exclude={"builds"})
    db_jumper = Jumper(**jumper_data)

    db.add(db_jumper)
    await db.commit()

    return await get_jumper(db, db_jumper.id)

async def create_build(db: AsyncSession, build_in: BuildCreate):
    doc = await db.get(Document, build_in.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    current_cp = doc.choice_points

    selected_drawbacks = []
    if build_in.drawback_ids:
        stmt = select(Drawback).where(Drawback.id.in_(build_in.drawback_ids))
        selected_drawbacks = list((await db.execute(stmt)).scalars().all())
        for drawback in selected_drawbacks:
            current_cp += drawback.profit

    selected_perks = []
    if build_in.perk_ids:
        from sqlalchemy.orm import selectinload
        stmt = (
            select(Perk)
            .where(Perk.id.in_(build_in.perk_ids))
            .options(selectinload(Perk.origin_discounts)) # Required for .get_actual_cost()
        )
        selected_perks = list((await db.execute(stmt)).scalars().all())
        for perk in selected_perks:
            current_cp -= perk.get_actual_cost(build_in.selected_origin_id)

    selected_items = []
    if build_in.item_ids:
        stmt = select(Item).where(Item.id.in_(build_in.item_ids))
        selected_items = list((await db.execute(stmt)).scalars().all())
        for item in selected_items:
            current_cp -= item.cost  # Assuming no item discounts for now

    new_build = Build(
        jumper_id=build_in.jumper_id,
        document_id=build_in.document_id,
        selected_origin_id=build_in.selected_origin_id,
        remaining_cp=current_cp,
        perks=selected_perks,
        items=selected_items,
        drawbacks=selected_drawbacks
    )

    db.add(new_build)
    await db.commit()
    await db.refresh(new_build)
    return new_build