from models.document import TraitCategory, Trait
from schemas.document import CategoryInput, TraitInput

def sync_pass_two(db_categories: list[TraitCategory], incoming_categories: list[CategoryInput], id_mapping: dict[int, Trait]) -> None:
    """Pass 2: Re-link foreign keys if needed (can be expanded for rule ID re-mapping later)"""
    pass

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
                is_modifier=incoming.is_modifier
            )
            db_traits.append(new_trait)
            id_mapping[incoming.id] = new_trait

def sync_categories(
    db_categories: list[TraitCategory], 
    incoming_categories: list[CategoryInput], 
    id_mapping: dict[int, Trait]
) -> None:
    
    existing_map = {cat.id: cat for cat in db_categories}
    incoming_map = {}
    for cat in incoming_categories:
        cat_id = getattr(cat, "id", -1)
        if cat_id > 0:
            incoming_map[cat_id] = cat
            
    items_to_remove = [cat for cat in db_categories if cat.id not in incoming_map]
    for cat in items_to_remove:
        db_categories.remove(cat)
        
    for idx, incoming in enumerate(incoming_categories):
        incoming_id = getattr(incoming, "id", -idx - 1) 
        
        if incoming_id > 0 and incoming_id in existing_map:
            existing = existing_map[incoming_id]
            existing.name = incoming.name
            existing.summary = incoming.summary
            existing.sort_order = idx
            existing.max_allowed = incoming.max_allowed
            existing.is_random = incoming.is_random
            existing.is_ordering = incoming.is_ordering
            sync_traits(existing.traits, incoming.traits, id_mapping)
            
        elif incoming_id < 0:
            new_category = TraitCategory(
                name=incoming.name,
                summary=incoming.summary, 
                sort_order=idx, 
                max_allowed=incoming.max_allowed,
                is_random=incoming.is_random,
                is_ordering=incoming.is_ordering
            )
            db_categories.append(new_category)
            sync_traits(new_category.traits, incoming.traits, id_mapping)