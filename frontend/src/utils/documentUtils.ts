import type { TraitCategory } from "../types/document";

export const getTraitNameById = (categories: TraitCategory[], id: number): string => {
	if (!id && id !== 0) return "Unknown";
	
	for (const cat of categories) {
		const found = cat.traits.find((t) => t.id === id);
		if (found) return found.name || "Unnamed Trait";
	}
	
	return "Unknown";
};