from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.document import Document, TraitCategory, Trait
from schemas.document import DocumentCreate, DocumentUpdate
from services.document_sync import sync_categories, sync_pass_two


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
    db_document = Document(
        title=document.title,
        choice_points=document.choice_points,
        summary=document.summary,
        has_random_age=document.has_random_age,
        age_roll_min=document.age_roll_min,
        age_roll_max=document.age_roll_max,
        age_bypass_trait_id=document.age_bypass_trait_id
    )
    
    id_mapping: dict[int, Trait] = {}
    sync_categories(db_document.categories, document.categories, id_mapping)
    
    db.add(db_document)
    await db.flush()  
    
    sync_pass_two(db_document.categories, document.categories, id_mapping)
    
    if db_document.age_bypass_trait_id is not None and db_document.age_bypass_trait_id < 0:
        mapped_trait = id_mapping.get(db_document.age_bypass_trait_id)
        if mapped_trait:
            db_document.age_bypass_trait_id = mapped_trait.id
    if db_document.gender_bypass_trait_id is not None and db_document.gender_bypass_trait_id < 0:
            mapped_trait = id_mapping.get(db_document.gender_bypass_trait_id)
            if mapped_trait:
                db_document.gender_bypass_trait_id = mapped_trait.id
            
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
    # Update the loop to include the new fields
    for key in ["title", "choice_points", "summary", "has_random_age", "age_roll_min", "age_roll_max", "age_bypass_trait_id", "gender_bypass_trait_id"]:
        if key in update_data:
            setattr(db_document, key, update_data[key])
            
    id_mapping: dict[int, Trait] = {}
    
    if document_update.categories is not None:
        sync_categories(db_document.categories, document_update.categories, id_mapping)
        await db.flush()
        sync_pass_two(db_document.categories, document_update.categories, id_mapping)

        if db_document.age_bypass_trait_id is not None and db_document.age_bypass_trait_id < 0:
            mapped_trait = id_mapping.get(db_document.age_bypass_trait_id)
            if mapped_trait:
                db_document.age_bypass_trait_id = mapped_trait.id
        if db_document.gender_bypass_trait_id is not None and db_document.gender_bypass_trait_id < 0:
            mapped_trait = id_mapping.get(db_document.gender_bypass_trait_id)
            if mapped_trait:
                db_document.gender_bypass_trait_id = mapped_trait.id

    await db.commit()

    await db.refresh(db_document)
    return db_document