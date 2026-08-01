import type { TraitCategory } from "../types/document";

export const defaultCategories: TraitCategory[] = [
	{ id: -1, name: "Origins", has_cost: true, max_allowed: 1, traits: [], is_random: false, bypass_trait_id: null, free_pick_trait_id: null },
	{ id: -2, name: "Perks", has_cost: true, max_allowed: -1, traits: [], is_random: false, bypass_trait_id: null, free_pick_trait_id: null },
	{ id: -3, name: "Items", has_cost: true, max_allowed: -1, traits: [], is_random: false, bypass_trait_id: null, free_pick_trait_id: null },
	{ id: -4, name: "Drawbacks", has_cost: false, max_allowed: 2, traits: [], is_random: false, bypass_trait_id: null, free_pick_trait_id: null },
];

export const defaultDocumentState = {
	title: "",
	choice_points: 1000,
	summary: "",
	has_random_age: false,
	age_roll_min: 14,
	age_roll_max: 25,
	age_bypass_trait_id: null,
	gender_bypass_trait_id: null,
	categories: defaultCategories,
};