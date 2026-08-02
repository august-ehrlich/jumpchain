import type { TraitCategory, Document } from "../types/document";

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