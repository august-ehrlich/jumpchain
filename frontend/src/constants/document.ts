import type { TraitCategory } from "../schemas/documentSchema";

export const defaultCategories: TraitCategory[] = [
	{ id: -1, name: "Origins", max_allowed: 1, traits: [], is_random: false},
	{ id: -2, name: "Perks", max_allowed: -1, traits: [], is_random: false},
	{ id: -3, name: "Items", max_allowed: -1, traits: [], is_random: false},
	{ id: -4, name: "Drawbacks", max_allowed: 2, traits: [], is_random: false},
];

export const defaultDocumentState  = {
	title: "",
	choice_points: 1000,
	summary: "",
	has_random_age: false,
	age_roll_min: 14,
	age_roll_max: 25,
	categories: defaultCategories,
	rules: []
};

export const CONDITION_TYPES = [
	{ value: "HAS_TRAIT", label: "Has Trait (ID)" },
	{ value: "MISSING_TRAIT", label: "Is Missing Trait (ID)" },
	{ value: "AGE_GREATER_THAN", label: "Age is Greater Than" },
	{ value: "ALWAYS", label: "Always Active" },
];

export const EFFECT_TYPES = [
	{ value: "SET_COST", label: "Set Trait Cost" },
	{ value: "MULTIPLY_COST", label: "Multiply Trait Cost" },
	{ value: "LOCK_TRAIT", label: "Lock Trait (Prevent Selection)" },
	{ value: "BYPASS_AGE_ROLL", label: "Bypass Random Age Roll" },
	{ value: "BYPASS_GENDER_LOCK", label: "Bypass Gender Lock" },
	{ value: "GRANT_CATEGORY_CP", label: "Grant Category CP" },
];

export const getTraitNameById = (categories: TraitCategory[], id: number): string => {
	if (!id && id !== 0) return "Unknown";
	
	for (const cat of categories) {
		const found = cat.traits.find((t) => t.id === id);
		if (found) return found.name || "Unnamed Trait";
	}
	
	return "Unknown";
};