export interface Discount {
	source_trait_id: number;
	discount: number;
}

export interface Trait {
	id: number;
	name: string;
	subtitle?: string;
	description: string;
	is_modifier: boolean;
	cost: number;
	discounts_received: Discount[];
}

export interface TraitCategory {
	id: number;
	name: string;
	summary?: string;
	has_cost: boolean;
	max_allowed: number;
	is_random?: boolean;
	bypass_trait_id?: number | null;
	free_pick_trait_id?: number | null;
	traits: Trait[];
}

export interface Document {
	id: number;
	title: string;
	choice_points: number;
	summary: string;
	categories: TraitCategory[];
}
