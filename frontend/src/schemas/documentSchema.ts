import { z } from "zod";

export const conditionSchema = z.object({
	type: z.string(),
	targetId: z.number().optional(),
	targetName: z.string().optional(),
	value: z.number().optional(),
});

export const effectSchema = z.object({
	type: z.string(),
	targetId: z.number().optional(),
	targetName: z.string().optional(),
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
	description: z.string(),
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

const baseDocumentSchema = z.object({
	title: z.string().min(1, "Title is required"),
	choice_points: z.number().min(0, "CP cannot be negative"),
	summary: z.string().min(1, "Summary is required"),
	has_random_age: z.boolean(),
	age_roll_min: z.number().min(0),
	age_roll_max: z.number().min(0),
	rules: z.array(ruleSchema).optional(),
	categories: z.array(categorySchema),
});

export const documentSchema = baseDocumentSchema.refine(
	(data) => {
		if (data.has_random_age) return data.age_roll_min <= data.age_roll_max;
		return true;
	},
	{ message: "Min age must be <= max age", path: ["age_roll_max"] }
);

export const apiDocumentSchema = baseDocumentSchema.extend({
	id: z.number(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;
export type Document = z.infer<typeof apiDocumentSchema>;
export type RuleCondition = z.infer<typeof conditionSchema>;
export type RuleEffect = z.infer<typeof effectSchema>;
export type Rule = z.infer<typeof ruleSchema>;
export type Trait = z.infer<typeof traitSchema>;
export type TraitCategory = z.infer<typeof categorySchema>;