
from models.document import  TraitCategory, Trait, TraitDiscount
from schemas.document import CategoryInput, TraitInput

def sync_discounts(incoming_categories: list[CategoryInput], id_mapping: dict[int, Trait]) -> None:
    """Pass 2: Re-link discounts using the ID mapping generated in Pass 1"""
    for cat_in in incoming_categories:
        for trait_in in cat_in.traits:
            db_trait = id_mapping.get(trait_in.id)
            if not db_trait:
                continue
                
            new_discounts : list[TraitDiscount] = []
            for disc_in in trait_in.discounts_received:
                source_trait = id_mapping.get(disc_in.source_trait_id)
                real_source_id = source_trait.id if source_trait else disc_in.source_trait_id
                
                new_discounts.append(TraitDiscount(
                    source_trait_id=real_source_id,
                    discount=disc_in.discount
                ))
                
            db_trait.discounts_received = new_discounts

def sync_traits(db_traits: list[Trait], incoming_traits: list[TraitInput], id_mapping: dict[int, Trait]) -> None:
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
            existing.subtitle = incoming.subtitle
            existing.is_modifier = incoming.is_modifier
            id_mapping[incoming.id] = existing
            
        elif incoming.id < 0:
            new_trait = Trait(
                name=incoming.name,
                description=incoming.description,
                cost=incoming.cost,
                subtitle=incoming.subtitle,
                is_modifier=incoming.is_modifier,
                discounts_received=[]
            )
            db_traits.append(new_trait)
            id_mapping[incoming.id] = new_trait

def sync_categories(
    db_categories: list[TraitCategory], 
    incoming_categories: list[CategoryInput], 
    id_mapping: dict[int, Trait]
) -> None:
    
    existing_map = {cat.id: cat for cat in db_categories}
    
    # Safely extract IDs, ignoring items that somehow have no ID
    incoming_map = {}
    for cat in incoming_categories:
        cat_id = getattr(cat, "id", -1)
        if cat_id > 0:
            incoming_map[cat_id] = cat
            
    items_to_remove = [cat for cat in db_categories if cat.id not in incoming_map]
    for cat in items_to_remove:
        db_categories.remove(cat)
        
    for idx, incoming in enumerate(incoming_categories):
        incoming_id = getattr(incoming, "id", -idx - 1) # Fallback to negative index
        
        if incoming_id > 0 and incoming_id in existing_map:
            existing = existing_map[incoming_id]
            existing.name = incoming.name
            existing.has_cost = incoming.has_cost
            existing.summary = incoming.summary
            existing.sort_order = idx
            existing.max_allowed = incoming.max_allowed
            sync_traits(existing.traits, incoming.traits, id_mapping)
            
        elif incoming_id < 0:
            new_category = TraitCategory(
                name=incoming.name, 
                has_cost=incoming.has_cost, 
                summary=incoming.summary, 
                sort_order=idx, 
                max_allowed=incoming.max_allowed
            )
            db_categories.append(new_category)
            sync_traits(new_category.traits, incoming.traits, id_mapping)