from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models import Document, TraitCategory, Trait, TraitDiscount
from schemas.document import DocumentCreate, TraitUpdate, CategoryUpdate, DocumentUpdate


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

async def create_document(db: AsyncSession, document: DocumentCreate):
    db_document = Document(
        title=document.title,
        choice_points=document.choice_points,
        summary=document.summary
    )
    
    id_mapping: dict[int, Trait] = {}
    
    # Pass 1: Create categories and traits
    for cat_create in document.categories:
        db_category = TraitCategory(name=cat_create.name, has_cost=cat_create.has_cost)
        
        for trait_create in cat_create.traits:
            db_trait = Trait(
                name=trait_create.name,
                description=trait_create.description,
                cost=trait_create.cost,
                discounts_received=[]
            )
            db_category.traits.append(db_trait)
            id_mapping[trait_create.id] = db_trait
            
        db_document.categories.append(db_category)

    db.add(db_document)
    await db.flush()
    
    for cat_create in document.categories:
        for trait_create in cat_create.traits:
            db_trait = id_mapping.get(trait_create.id)
            if not db_trait:
                continue
                
            for disc_create in trait_create.discounts_received:
                source_trait = id_mapping.get(disc_create.source_trait_id)
                real_source_id = source_trait.id if source_trait else disc_create.source_trait_id
                
                db_trait.discounts_received.append(TraitDiscount(
                    source_trait_id=real_source_id,
                    discount=disc_create.discount
                ))
    
    await db.commit()
    
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

def sync_traits(db_traits: list[Trait], incoming_traits: list[TraitUpdate], id_mapping: dict[int, Trait]) -> None:
    existing_map = {item.id: item for item in db_traits}
    incoming_map = {item.id: item for item in incoming_traits if item.id > 0}
    
    items_to_remove = [item for item in db_traits if item.id not in incoming_map]
    for item in items_to_remove:
        db_traits.remove(item)
        
    for incoming in incoming_traits:
        if incoming.id > 0 and incoming.id in existing_map:
            existing = existing_map[incoming.id]
            existing.name = incoming.name
            existing.description = incoming.description
            existing.cost = incoming.cost
            id_mapping[incoming.id] = existing
            
        elif incoming.id < 0:
            new_trait = Trait(
                name=incoming.name,
                description=incoming.description,
                cost=incoming.cost,
                discounts_received=[]
            )
            db_traits.append(new_trait)
            id_mapping[incoming.id] = new_trait

def sync_categories(db_categories: list[TraitCategory], incoming_categories: list[CategoryUpdate], id_mapping: dict[int, Trait]) -> None:
    existing_map = {cat.id: cat for cat in db_categories}
    incoming_map = {cat.id: cat for cat in incoming_categories if cat.id > 0}
    
    items_to_remove = [cat for cat in db_categories if cat.id not in incoming_map]
    for cat in items_to_remove:
        db_categories.remove(cat)
        
    for incoming in incoming_categories:
        if incoming.id > 0 and incoming.id in existing_map:
            existing = existing_map[incoming.id]
            existing.name = incoming.name
            existing.has_cost = incoming.has_cost
            sync_traits(existing.traits, incoming.traits, id_mapping)
            
        elif incoming.id < 0:
            new_category = TraitCategory(name=incoming.name, has_cost=incoming.has_cost)
            db_categories.append(new_category)
            sync_traits(new_category.traits, incoming.traits, id_mapping)


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
        # Pass 1: Build traits and populate the dictionary
        sync_categories(db_document.categories, document_update.categories, id_mapping)
        
        await db.flush()
        
        for cat_in in document_update.categories:
            for trait_in in cat_in.traits:
                db_trait = id_mapping.get(trait_in.id)
                if not db_trait:
                    continue
                    
                new_discounts : list[TraitDiscount] = []
                for disc_in in trait_in.discounts_received:
                    # Look up the actual database object for the source
                    source_trait = id_mapping.get(disc_in.source_trait_id)
                    real_source_id = source_trait.id if source_trait else disc_in.source_trait_id
                    
                    new_discounts.append(TraitDiscount(
                        source_trait_id=real_source_id,
                        discount=disc_in.discount
                    ))
                    
                # Assigning the new list automatically drops old orphans
                db_trait.discounts_received = new_discounts

    await db.commit()
    await db.refresh(db_document)
    return db_document