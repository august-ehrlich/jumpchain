from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.document import Document, Origin, Perk, Drawback, Item
from schemas.document import DocumentCreate

async def get_document(db: AsyncSession, document_id: int):
    stmt = (
        select(Document)
        .where(Document.id == document_id)
        .options(
            selectinload(Document.origins).selectinload(Origin.perk_discounts),
            selectinload(Document.perks).selectinload(Perk.origin_discounts),
            selectinload(Document.items),
            selectinload(Document.drawbacks).selectinload(Drawback.locked_origins)
        )
    )
    return (await db.execute(stmt)).scalar_one_or_none()

async def create_document(db: AsyncSession, document: DocumentCreate):
    doc_data = document.model_dump(exclude={"origins", "perks", "items", "drawbacks"})
    db_document = Document(**doc_data)

    db_document.origins = [Origin(**o.model_dump()) for o in document.origins]
    db_document.perks = [Perk(**p.model_dump()) for p in document.perks]
    db_document.items = [Item(**i.model_dump()) for i in document.items]
    db_document.drawbacks = [Drawback(**d.model_dump()) for d in document.drawbacks]

    db.add(db_document)
    await db.commit()

    return await get_document(db, db_document.id)