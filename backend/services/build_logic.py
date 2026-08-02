from fastapi import HTTPException
from models.document import Document, Trait

def validate_and_calculate_build(doc: Document, trait_ids: list[int]) -> tuple[list[Trait], int]:
    """Returns the validated traits and the remaining CP using the dynamic rules engine."""
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
            
    # Check max category limits
    for c in doc.categories:
        if c.max_allowed != -1 and category_counts.get(c.id, 0) > c.max_allowed:
            raise HTTPException(
                status_code=400, 
                detail=f"Exceeded max allowed traits ({c.max_allowed}) in category '{c.name}'"
            )
            
    selected_ids = set(trait_ids)
    
    # --- RULE ENGINE EVALUATION ---
    modified_costs: dict[int, float] = {}
    locked_traits: set[int] = set()

    for rule in (doc.rules or []):
        conditions = rule.get("conditions", [])
        effects = rule.get("effects", [])

        # Evaluate conditions (AND logic)
        conditions_met = True
        for cond in conditions:
            cond_type = cond.get("type")
            target_id = cond.get("targetId")

            if cond_type == "HAS_TRAIT":
                if target_id not in selected_ids:
                    conditions_met = False
                    break
            elif cond_type == "MISSING_TRAIT":
                if target_id in selected_ids:
                    conditions_met = False
                    break

        # If conditions pass, apply effects
        if conditions_met:
            for effect in effects:
                effect_type = effect.get("type")
                target_id = effect.get("targetId")

                if effect_type == "MULTIPLY_COST" and target_id:
                    multiplier = effect.get("value", 1.0)
                    base_cost = doc_traits[target_id][0].cost if target_id in doc_traits else 0
                    current = modified_costs.get(target_id, float(base_cost))
                    modified_costs[target_id] = current * multiplier

                elif effect_type == "SET_COST" and target_id:
                    val = effect.get("value", 0)
                    modified_costs[target_id] = float(val)

                elif effect_type == "LOCK_TRAIT" and target_id:
                    locked_traits.add(target_id)

    # Validate that no locked traits were selected
    for tid in selected_ids:
        if tid in locked_traits:
            raise HTTPException(status_code=400, detail=f"Trait {tid} is locked and cannot be selected.")

    # Calculate final CP spent
    spent_cp = 0
    for t in selected_traits:
        if t.cost < 0:
            spent_cp += t.cost 
        else:
            final_cost = modified_costs.get(t.id, float(t.cost))
            spent_cp += round(final_cost)
            
    remaining_cp = doc.choice_points - spent_cp
    if remaining_cp < 0:
        raise HTTPException(status_code=400, detail=f"Over budget! Deficit of {abs(remaining_cp)} CP.")
        
    return selected_traits, remaining_cp