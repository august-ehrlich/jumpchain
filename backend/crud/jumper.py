from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from models.jumper import Jumper
from schemas.jumper import  JumperCreate

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