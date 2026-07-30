from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.document import Document, TraitCategory, Trait
from schemas.document import DocumentCreate, DocumentUpdate
from services.document_sync import sync_categories, sync_discounts


async def get_document(db: AsyncSession, document_id: int):
    stmt = select(Document).options(
        selectinload(Document.categories)
        .selectinload(TraitCategory.traits)
        .selectinload(Trait.discounts_received)
    ).where(Document.id == document_id)
    
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_documents(db: AsyncSession, skip: int = 0, limit: int = 100):
    stmt = select(Document).options(
        selectinload(Document.categories)
        .selectinload(TraitCategory.traits)
        .selectinload(Trait.discounts_received)
    ).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    return result.scalars().all()

async def create_document(db: AsyncSession, document: DocumentCreate) -> Document:
    # 1. Initialize the root document
    db_document = Document(
        title=document.title,
        choice_points=document.choice_points,
        summary=document.summary
    )
    
    id_mapping: dict[int, Trait] = {}
    
    # 2. Pass 1: Build traits and populate the mapping dictionary
    sync_categories(db_document.categories, document.categories, id_mapping)
    
    db.add(db_document)
    await db.flush()  # Flushes to DB to generate the real primary keys
    
    # 3. Pass 2: Re-link discounts using the generated mapping
    sync_discounts(document.categories, id_mapping)
    
    await db.commit()
    
    # 4. Fetch the complete document hierarchy to return
    stmt = select(Document).options(
        selectinload(Document.categories)
        .selectinload(TraitCategory.traits)
        .selectinload(Trait.discounts_received)
    ).where(Document.id == db_document.id)
    
    result = await db.execute(stmt)
    return result.scalar_one()

async def delete_document(db: AsyncSession, document_id: int):
    db_document = await get_document(db, document_id)
    if not db_document:
        return False
        
    await db.delete(db_document)
    await db.commit()
    return True

async def update_document(db: AsyncSession, document_id: int, document_update: DocumentUpdate):
    stmt = select(Document).options(
        selectinload(Document.categories)
        .selectinload(TraitCategory.traits)
        .selectinload(Trait.discounts_received)
    ).where(Document.id == document_id)
    
    result = await db.execute(stmt)
    db_document = result.scalar_one_or_none()
    
    if not db_document:
        return None
        
    update_data = document_update.model_dump(exclude_unset=True)
    for key in ["title", "choice_points", "summary"]:
        if key in update_data:
            setattr(db_document, key, update_data[key])
            
    id_mapping: dict[int, Trait] = {}
    
    if document_update.categories is not None:
        sync_categories(db_document.categories, document_update.categories, id_mapping)
        await db.flush()

        sync_discounts(document_update.categories, id_mapping)

    await db.commit()

    await db.refresh(db_document)
    return db_document