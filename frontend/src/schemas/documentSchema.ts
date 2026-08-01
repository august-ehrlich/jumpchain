import { z } from "zod";

export const discountSchema = z.object({
	source_trait_id: z.number(),
	discount: z.number().min(1).max(100),
});

export const traitSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Trait name is required"),
	subtitle: z.string().optional(),
	description: z.string(),
	cost: z.number(),
	is_modifier: z.boolean(), // Removed .default(false)
	discounts_received: z.array(discountSchema), // Removed .default([])
});

export const categorySchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Category name is required"),
	summary: z.string().optional(),
	has_cost: z.boolean(), // Removed .default(true)
	max_allowed: z.number(),
	is_random: z.boolean(), // Removed .default(false)
	bypass_trait_id: z.number().nullable(),
	free_pick_trait_id: z.number().nullable(),
	traits: z.array(traitSchema), // Removed .default([])
});

export const documentSchema = z.object({
	title: z.string().min(1, "Title is required"),
	choice_points: z.number().min(0, "CP cannot be negative"),
	summary: z.string().min(1, "Summary is required"),
	has_random_age: z.boolean(), // Removed .default(false)
	age_roll_min: z.number().min(0),
	age_roll_max: z.number().min(0),
	age_bypass_trait_id: z.number().nullable(),
	gender_bypass_trait_id: z.number().nullable(),
	categories: z.array(categorySchema), // Removed .default([])
}).refine(
	(data) => {
		if (data.has_random_age) {
			return data.age_roll_min <= data.age_roll_max;
		}
		return true;
	},
	{
		message: "Minimum age must be less than or equal to maximum age",
		path: ["age_roll_max"],
	}
);

export type DocumentFormData = z.infer<typeof documentSchema>;