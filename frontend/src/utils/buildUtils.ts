import type { Discount } from "../types/document";

export function calculateTraitCost(
	baseCost: number,
	discounts: Discount[],
	selectedIds: Set<number>
): number {
	if (baseCost <= 0) return baseCost;

	let currentCost = baseCost;
	
	discounts.forEach((d) => {
		if (selectedIds.has(d.source_trait_id)) {
			currentCost *= 1 - (d.discount / 100);
		}
	});

	return Math.round(currentCost);
}