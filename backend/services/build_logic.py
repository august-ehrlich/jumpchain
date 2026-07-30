from fastapi import HTTPException
from models.document import Document, Trait

def validate_and_calculate_build(doc: Document, trait_ids: list[int]) -> tuple[list[Trait], int]:
    """Returns the validated traits and the remaining CP."""
    doc_traits = {t.id: (t, c) for c in doc.categories for t in c.traits}
    selected_traits: list[Trait] = []
    category_counts: dict[int, int] = {}
    
    for tid in trait_ids:
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
    selected_ids = set(trait_ids)
    
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
        
    return selected_traits, remaining_cp