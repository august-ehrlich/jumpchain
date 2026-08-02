import { z } from "zod";

const conditionSchema = z.object({
	type: z.string(),
	targetId: z.number().optional(),
	value: z.number().optional(),
});

const effectSchema = z.object({
	type: z.string(),
	targetId: z.number().optional(),
	value: z.number().optional(),
});

export const ruleSchema = z.object({
	name: z.string().min(1, "Rule name is required"),
	ui_context: z.record(z.any()).optional(),
	conditions: z.array(conditionSchema),
	effects: z.array(effectSchema),
});

export const traitSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Trait name is required"),
	subtitle: z.string().optional().nullish(),
	description: z.string().nullish(),
	cost: z.number(),
	is_modifier: z.boolean(),
	_visual_discounts: z.any().optional(),
});

export const categorySchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Category name is required"),
	summary: z.string().nullish(),
	max_allowed: z.number(),
	is_random: z.boolean(),
	is_ordering: z.boolean().optional(),
	traits: z.array(traitSchema),
});

export const documentSchema = z.object({
	title: z.string().min(1, "Title is required"),
	choice_points: z.number().min(0, "CP cannot be negative"),
	summary: z.string().min(1, "Summary is required").nullish(),
	has_random_age: z.boolean(),
	age_roll_min: z.number().min(0),
	age_roll_max: z.number().min(0),
	rules: z.any().optional(), 
	categories: z.array(categorySchema),
}).refine(
	(data) => {
		if (data.has_random_age) return data.age_roll_min <= data.age_roll_max;
		return true;
	},
	{ message: "Min age must be <= max age", path: ["age_roll_max"] }
);

export type DocumentFormData = z.infer<typeof documentSchema>;

