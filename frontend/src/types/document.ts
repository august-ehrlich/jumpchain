export interface RuleCondition {
	type: string;
	targetId?: number;
	value?: number;
}

export interface RuleEffect {
	type: string;
	targetId?: number;
	value?: number;
}

export interface Rule {
	name: string;
	ui_context?: Record<string, any>;
	conditions: RuleCondition[];
	effects: RuleEffect[];
}

export interface Trait {
	id: number;
	name: string;
	subtitle?: string;
	description: string;
	is_modifier: boolean;
	cost: number;
}

export interface TraitCategory {
	id: number;
	name: string;
	summary?: string;
	max_allowed: number;
	is_random?: boolean;
	is_ordering?: boolean;
	traits: Trait[];
}

export interface Document {
	id: number;
	title: string;
	choice_points: number;
	summary: string;
	has_random_age: boolean;
	age_roll_min: number;
	age_roll_max: number;
	rules: Rule[];
	categories: TraitCategory[];
}